/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See https://github.com/microsoft/vscode/blob/d31496c866683bdbccfc85bc11a3107d6c789b52/LICENSE.txt
 *--------------------------------------------------------------------------------------------*/
// From https://github.com/microsoft/vscode/blob/d31496c866683bdbccfc85bc11a3107d6c789b52/src/vs/editor/contrib/snippet/snippetVariables.ts

export const KnownSnippetVariableNames: { [key: string]: true } = Object.freeze({
	'CURRENT_YEAR': true,
	'CURRENT_YEAR_SHORT': true,
	'CURRENT_MONTH': true,
	'CURRENT_DATE': true,
	'CURRENT_HOUR': true,
	'CURRENT_MINUTE': true,
	'CURRENT_SECOND': true,
	'CURRENT_DAY_NAME': true,
	'CURRENT_DAY_NAME_SHORT': true,
	'CURRENT_MONTH_NAME': true,
	'CURRENT_MONTH_NAME_SHORT': true,
	'CURRENT_SECONDS_UNIX': true,
	'SELECTION': true,
	'CLIPBOARD': true,
	'TM_SELECTED_TEXT': true,
	'TM_CURRENT_LINE': true,
	'TM_CURRENT_WORD': true,
	'TM_LINE_INDEX': true,
	'TM_LINE_NUMBER': true,
	'TM_FILENAME': true,
	'TM_FILENAME_BASE': true,
	'TM_DIRECTORY': true,
	'TM_FILEPATH': true,
	'RELATIVE_FILEPATH': true,
	'BLOCK_COMMENT_START': true,
	'BLOCK_COMMENT_END': true,
	'LINE_COMMENT': true,
	'WORKSPACE_NAME': true,
	'WORKSPACE_FOLDER': true,
	'RANDOM': true,
	'RANDOM_HEX': true,
	'UUID': true
});