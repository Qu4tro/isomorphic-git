import { InternalError } from 'errors/InternalError'
import { readPackIndex } from 'storage/readPackIndex'
import { join } from 'utils/join'

export async function expandOidPacked({
  fs,
  gitdir,
  oid: short,
  getExternalRefDelta,
}) {
  // Iterate through all the .pack files
  const results = []
  let list = await fs.readdir(join(gitdir, 'objects/pack'))
  list = list.filter(x => x.endsWith('.idx'))
  for (const filename of list) {
    const indexFile = `${gitdir}/objects/pack/${filename}`
    const p = await readPackIndex({
      fs,
      filename: indexFile,
      getExternalRefDelta,
    })
    if (p.error) throw new InternalError(p.error)
    // Search through the list of oids in the packfile
    for (const oid of p.offsets.keys()) {
      if (oid.startsWith(short)) results.push(oid)
    }
  }
  return results
}
