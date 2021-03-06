import { app, BrowserWindow } from 'electron'
import * as utils from '../../lib/utils'

const availableWindows = new Map()
const currentWindows = new Map()

let vuexStore = null
let vuexNamespace = ''

export default {
    setupAppEvents () {
        app.on('activate', () => {
            this.createMainWindow()
        })

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
                currentWindows.clear()
            }
        })
    },

    hasWindow (name) {
        return currentWindows.has(name)
    },

    get (name) {
        if (!this.hasWindow(name)) {
            return null
        }

        return currentWindows.get(name)
    },

    focus (name) {
        const win = this.get(name)

        if (!win) {
            this.show(name)
            return
        }

        if (win.isMinimized()) {
            win.restore()
        }

        win.focus()
    },

    show (name) {
        if (!this.hasWindow(name)) {
            this.createWindow(name)
            return
        }

        this.get(name).show()
    },

    close (name) {
        if (!this.hasWindow(name)) {
            return
        }

        this.get(name).close()
    },

    getWindowUrl (path = '') {
        return process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/#${path}`
            : `file://${__dirname}/index.html#${path}`
    },

    addWindowEvents (name, window) {
        window.on('closed', () => {
            currentWindows.delete(name)
        })
        window.on('closed', () => {
            if (!vuexStore) {
                return
            }

            vuexStore.dispatch(`${vuexNamespace}/close`, name)
        })

        window.once('ready-to-show', () => {
            window.show()
        })
    },

    createWindow (name) {
        if (!availableWindows.has(name)) {
            return
        }

        const opts = availableWindows.get(name)
        const {url, window} = opts

        this.createAndOpenWindow({name, url}, window)
    },

    createAndOpenWindow ({name, url = ''}, windowProps) {
        if (this.hasWindow(name)) {
            this.focus(name)
            return
        }

        // assigning the parent-window itself to the parent option if its name was passed in.
        // useful for creating window relationships such as modals
        let {parent} = windowProps
        if (parent && typeof parent === 'string' && this.hasWindow(parent)) {
            parent = currentWindows.get(parent)
        }

        // custom setters
        const { aspectRatio } = windowProps

        const window = new BrowserWindow({
            ...windowProps,
            parent,
            show: !!windowProps.modal // windows will be auto-opened on ready-to-show to prevent flickering
        })

        if (aspectRatio) {
            window.setAspectRatio(aspectRatio)
        }
        this.addWindowEvents(name, window)
        window.loadURL(this.getWindowUrl(url))

        currentWindows.set(name, window)
    },

    createMainWindow () {
        if (this.hasWindow('main')) {
            this.focus('main')
            return
        }

        this.show('main')
    },

    registerWindow (name, window) {
        availableWindows.set(name, window)

        if (window.show) {
            app.once('ready', () => {
                this.createWindow(name)
            })
        }
    },

    registerWindows (windows) {
        const map = new Map(Object.entries(windows))
        map.forEach((opts, key) => {
            this.registerWindow(key, opts)
        })
    },

    onStoreMutation ({action, payload: name}) {
        if (typeof name !== 'string') {
            return
        }

        if (!availableWindows.has(name)) {
            return
        }

        if (action === 'SHOW_WINDOW') {
            this.show(name)
        } else if (action === 'CLOSE_WINDOW') {
            this.close(name)
        }
    },

    connectToStore ({store, namespace}) {

        vuexStore = store
        vuexNamespace = namespace

        utils.connectToStore({
            store,
            namespace,
            onStoreMutation: this.onStoreMutation.bind(this)
        })
    }
}
