import mixin from './mixin'
import types from '~/types'

import { createLogger } from '#/lib/logger'

const logger = createLogger('zcoin:network:app')

export default {

    ...mixin,
    ...({
        namespace: 'App',

        mutations: {
            [types.app.DAEMON_STOP]: 'stopDaemon',
            [types.app.LOCK_WALLET]: 'lockWallet'
        }
    }),

    stopDaemon () {
        logger.info('stopping the daemon')

        this.send({
            collection: 'stop',
            type: 'initial'
        })
    },

    lockWallet (payload) {
        logger.info('GOING TO LOCK WALLET', payload)
        const { passphrase } = payload

        this.send({
            collection: 'setPassphrase',
            type: 'create',
            auth: {
                passphrase
            }
        }, {
            onSuccess: types.app.DAEMON_RESTART,
            onError: ({ _meta, error }) => {
                logger.error('on setPassphrase error!', _meta, error)
                // this.dispatchAction(types.app.DAEMON_RESTART)
            }
        })
    }
}
