import dotenv from 'dotenv'
dotenv.config()
import { syncAll } from '../src/services/sync.service'

syncAll()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
