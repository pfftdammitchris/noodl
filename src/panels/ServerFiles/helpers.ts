import * as T from './types'
import * as u from '../../utils/common'

export function createInitialGroupedFiles(): T.ServerFilesGroupedFiles {
	return Object.keys(u.createGroupedMetadataObjects()).reduce(
		(acc, group) => Object.assign(acc, { [group]: {} }),
		{} as T.ServerFilesGroupedFiles,
	)
}
