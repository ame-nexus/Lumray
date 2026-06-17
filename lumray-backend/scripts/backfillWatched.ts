import dotenv from 'dotenv'
dotenv.config()
import { prisma } from '../src/lib/prisma'

/**
 * One-off, idempotent backfill: any film with a diary entry is "watched",
 * so ensure it has a row in the Watched table. Safe to run multiple times
 * (skipDuplicates + unique [userId, movieId]). Additive only — never deletes.
 */
async function main() {
    const pairs = await prisma.diaryEntry.findMany({
        select: { userId: true, movieId: true },
        distinct: ['userId', 'movieId'],
    })

    if (pairs.length === 0) {
        console.log('No diary entries to backfill.')
        return
    }

    const result = await prisma.watched.createMany({
        data: pairs.map(p => ({ userId: p.userId, movieId: p.movieId })),
        skipDuplicates: true,
    })

    console.log(`Backfilled ${result.count} Watched rows (from ${pairs.length} distinct logged films).`)
}

main()
    .catch(err => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
