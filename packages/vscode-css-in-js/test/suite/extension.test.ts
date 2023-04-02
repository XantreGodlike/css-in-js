import { assert } from 'chai'
import { afterEach, beforeEach, test } from 'mocha'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import { selectAllText, sleep, writeText } from './utils'
// import * as myExtension from '../../extension';

const EXTENSION_COMMAND = 'extension.convertCSSinJS'

const runConvertCommand = async () => {
  await vscode.commands.executeCommand(EXTENSION_COMMAND)
  // executeCommand is async, so we need to wait for the command to finish
  await sleep(100)
}

test('Extension has convert options in workbench', async () => {
  const convertOptions = await vscode.commands.getCommands(true)
  assert.include(
    convertOptions,
    EXTENSION_COMMAND,
    'Convert options should be available'
  )
})

const assertStringEqual = (actual: string, expected: string, error?: string) =>
  assert.equal(
    prepareForComparison(actual),
    prepareForComparison(expected),
    error
  )

const prepareForComparison = (text: string) => text.split('\r\n').join('\n')

const testConvert = (language: 'typescript' | 'javascript') => async () => {
  await vscode.commands.executeCommand('workbench.action.files.newUntitledFile')
  const textEditor = vscode.window.activeTextEditor
  assert(textEditor, 'Text editor should be opened')
  const textDocument = textEditor?.document
  assert(textDocument, 'Document should be opened')

  await vscode.languages.setTextDocumentLanguage(textDocument, language)

  const write = writeText(textEditor)

  await write(stylesJsObject)
  assertStringEqual(
    textDocument.getText(),
    stylesJsObject,
    'Should be equal initial'
  )

  selectAllText(textEditor)
  assertStringEqual(
    textDocument.getText(),
    textDocument.getText(textEditor.selection),
    'All text should be selected'
  )

  await runConvertCommand()

  assertStringEqual(
    textDocument.getText(),
    stylesCss,
    'Should convert correctly'
  )

  await runConvertCommand()
  assertStringEqual(
    textDocument.getText(),
    stylesJsObject,
    'Should convert correctly'
  )
}

suite('Extension convertion test', () => {
  beforeEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors')
  })

  afterEach(async () => {})

  test('Works in typescript', testConvert('typescript'))

  test('Works with javascript', testConvert('javascript'))
})

const stylesJsObject = `\
  display: 'fixed',
  top: 0,
`
const stylesCss = `\
  display: fixed;
  top: 0;
`
