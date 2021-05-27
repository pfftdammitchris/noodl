import * as T from './types'
import * as u from '../../utils/common'

export function createInitialGroupedFiles(): T.GetServerFiles.GroupedFiles {
	return Object.keys(u.createGroupedMetadataObjects()).reduce(
		(acc, group) => Object.assign(acc, { [group]: {} }),
		{} as T.GetServerFiles.GroupedFiles,
	)
}
