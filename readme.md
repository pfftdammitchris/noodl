# noodl-cli

## Install

```bash
$ npm install --global noodl-cli
```

## Usage

```
$ noodl-cli --help

  Usage
    $ noodl <input>

  Options
    --config meet4d
    --device web
    --env test
    --fetch
    --generate app
    --local
    --retrieve
    --server
    --start
    --version latest
    --watch
    --wss

  Examples
    $ noodl --config meet4d -e test --server --local --wss --watch
```

- https://github.com/sindresorhus/wait-for-localhost
- https://github.com/sindresorhus/strip-json-comments
- https://github.com/sindresorhus/first-run
- https://github.com/sindresorhus/latest-version
- https://github.com/sindresorhus/clipboardy
- https://github.com/AriaMinaei/pretty-error

## GitLab graphql query templates

```graphql
{
	project(fullPath: "frontend/aitmed-noodl-web") {
		archived
		avatarUrl
		containerRegistryEnabled
		createdAt
		description
		forksCount
		fullPath
		mergeRequests {
			nodes {
				createdAt
				description
				defaultMergeCommitMessage
				diffRefs {
					baseSha
					headSha
					startSha
				}
				discussions {
					nodes {
						id
						createdAt
						notes {
							edges {
								node {
									id
									author {
										name
										username
										webUrl
									}
									createdAt
								}
							}
						}
						replyId
					}
				}
				title
				totalTimeSpent
				updatedAt
				webUrl
			}
		}
		group {
			avatarUrl
			description
			name
			fullName
			fullPath
			id
			webUrl
			path
			projects {
				nodes {
					fullPath
				}
			}
			requestAccessEnabled
			rootStorageStatistics {
				buildArtifactsSize
				packagesSize
				lfsObjectsSize
				repositorySize
				storageSize
				wikiSize
			}
			visibility
			webUrl
		}
		requestAccessEnabled
		visibility
		webUrl
		starCount
		statistics {
			buildArtifactsSize
			packagesSize
			lfsObjectsSize
			repositorySize
			storageSize
			wikiSize
		}
		httpUrlToRepo
		sshUrlToRepo
		importStatus
		lastActivityAt
		lfsEnabled

		repository {
			rootRef
			tree {
				lastCommit {
					author {
						name
						username
						webUrl
						avatarUrl
					}
					id
					description
					title
					sha
					authoredDate
					latestPipeline {
						createdAt
						duration
					}
					signatureHtml
					webUrl
				}
				submodules {
					nodes {
						id
						name
						path
						webUrl
						type
					}
				}
			}
		}
	}
}
```
