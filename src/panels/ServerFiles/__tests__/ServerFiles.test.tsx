import React from 'react'
import test from 'ava'
import { Text } from 'ink'
import { render } from 'ink-testing-library'
import ServerFiles from '..'

test('fsafasffdasdasdsadssafasfas', (t) => {
	const { lastFrame, rerender } = render(<ServerFiles />)
	lastFrame() === 'Cofasfsunt: 0' //=> true

	rerender(<ServerFiles />)
	lastFrame() === 'Count: 1' //=> true

	t.fail()
})
