let btnSolve = null
let btnClear = null
let grid = null
let hasUserEntryErrors = false
let cells = null
let stack = []
let countOfGuesses = 0
let continueRecusiveGuessing = true

let matrix = null
let cellSize = null

let gridStyle = null
let regionStyle = null
let cellStyle = null

let log = null

class Log{
    constructor(){
        this.entries = []
        this.start = 0
        this.msg = ""
    }
    entry(msg){
        if (this.start === 0){
            this.start = Date.now()
            this.msg = msg
        } else {
            let now = Date.now()
            let sec = (now - this.start) / 1000
            this.entries.push(`${this.msg}: ${sec} seconds`)
            this.start = now
            this.msg = msg
        }
    }
    end(){
        let sec = (Date.now() - this.start) / 1000
        this.entries.push(`${this.msg}: ${sec} seconds`)
        this.entries.forEach((e) => {
            console.log(e)
        })
        this.reset()
    }
    reset(){
        this.entries = []
        this.start = 0
        this.msg = ""
    }
}

function init(){
    grid = document.getElementById("grid")
    matrix = 3
    cellSize = 90
    doStyling()
    makeGrid()
    wireUpControls()
    cells = document.querySelectorAll('.cell')
}

//#region Setup

function doStyling(){
    regionStyle = `border:solid 2px #555;width:${matrix*cellSize}px;margin-right:-2px;margin-bottom:-2px;display:inline-block`
    cellStyle = `width:${cellSize}px;height:${cellSize}px;text-align:center;font-size:${cellSize*.6}px;`
    document.getElementById('main').setAttribute('style',`min-width:${getMainMinwidth()};`)
}

function getMainMinwidth(){
    let main = document.getElementById('main')
    let mainPadding = parseFloat(window.getComputedStyle(main,null).getPropertyValue('padding-left')) * 2
    let mainGap = parseFloat(window.getComputedStyle(main,null).getPropertyValue('gap'))
    
    let cons = document.getElementById('console')
    let consPadding = parseFloat(window.getComputedStyle(cons,null).getPropertyValue('padding-left')) * 2
    
    let btn = document.getElementById('btnSolve')
    let btnWidth = parseFloat(window.getComputedStyle(btn,null).getPropertyValue('min-width'))
    
    return mainPadding + mainGap + consPadding + btnWidth + (matrix * cellSize * matrix)
}

function makeGrid(){
    // console.log('makeGrid')
    grid.innerHTML = null
    for (let i = 1; i <= matrix; i++) {
        let subGridRowStartNum = (i - 1) * matrix
        grid.appendChild(makeSubGridRow(subGridRowStartNum))
    }
}

function makeSubGridRow(subGridRowStartNum) {
    // console.log('> makeSubGridRow')
    let div = document.createElement('div')
    for (let i = 1; i <= matrix; i ++) {
        div.appendChild(makeSubGrid(subGridRowStartNum,subGridRowStartNum + i))
    }
    return div
}

function makeSubGrid(subGridRowStartNum,subGridNum) {
    // console.log('> makeSubGrid')
    let div = document.createElement('div')
    div.setAttribute('style', regionStyle)
    for (let i = 1; i <= matrix; i++) {
        let rowNum = subGridRowStartNum + i
        div.appendChild(makeCellRow(subGridNum,rowNum))
    }
    return div
}

function makeCellRow(subGridNum,rowNum) {
    // console.log('>> makeCellRow')
    let div = document.createElement('div')
    for (let i = 1; i <= matrix; i++) {
        let colNum = getColumnNumber(subGridNum,i)
        div.appendChild(makeCell(subGridNum,colNum,rowNum))
    }
    return div
}

function getColumnNumber(subGridNum,relativeColumnNumber) {
    // console.log('>> getColumnNumber')
    while (subGridNum > matrix) {
        subGridNum = subGridNum - matrix
    }
    return (subGridNum - 1) * matrix + relativeColumnNumber
}

function makeCell(reg,col,row) {
    // console.log('>>> makeCell')
    let cell = document.createElement('input')
        cell.classList.add('cell')
        cell.setAttribute('style', cellStyle)
        cell.setAttribute('data-row',row)
        cell.setAttribute('data-column',col)
        cell.setAttribute('data-region',reg)
        cell.setAttribute('id',`${row}.${col}.${reg}`)
        cell.addEventListener('input',(event) => {validateEntry(event)})
    return cell
}

//#endregion

//#region Controls

function wireUpControls(){
    btnClear = document.getElementById('btnClear')
    btnClear.addEventListener('click',() => {
        handleBtnClear()
    })
    btnSolve = document.getElementById('btnSolve')
    btnSolve.addEventListener('click',() => {
        handleBtnSolve()
    })
}

function handleBtnClear(){
    grid = null
    init()
}

function handleBtnSolve(){
    if (hasUserEntryErrors) {
        alert('Correct errors before solving')
    } else {
        solvePuzzle()
    }
}

//#endregion

//#region User entry validation

function validateEntry(event) {
    hasUserEntryErrors = false
    clearStyles()
    validateCellValue(event)
    validateAreas()
}

function validateCellValue(event) {
    // console.log('validateCellValue')
    let num = parseInt(event.target.value)
    if (isNaN(num) || num > matrix**2 || num === 0) {
        event.target.value = null
    } else {
        event.target.value = num
    }
}

function validateAreas(){
    let types = ['row','column','region']
    types.forEach((type) => {
        validateArea(type)
    })
}

function validateArea(type) {
    for (let i = 1; i <= matrix**2; i++) {
        let areaCells = document.querySelectorAll(`.cell[data-${type}='${i}']`)
        let values = getAreaValues(areaCells)
        let hasError = areaHasError(areaCells,values)
        if (hasError){
            areaCells.forEach((c) => {
                c.classList.add('area-error')
            })
        }
    }
}

function getAreaValues(cells) {
    let result = []
    cells.forEach((c) => {
        if (!isNaN(parseInt(c.value))) result.push(c.value)
    })
    return result
}

function areaHasError(areaCells,values) {
    let result = false
    areaCells.forEach((c) => {
        let n = values.filter((x) => {
            return x == c.value
        })
        if (n.length > 1) {
            c.classList.add('error')
            hasUserEntryErrors = true
            result = true
        } 
    })
    return result
}

//#endregion

//#region Solve Puzzle

function solvePuzzle(){
    log = new Log()
    log.entry('Preset Cells')
    setPresetCells()
    log.entry('Forced Cells')
    setForcedCells()
    // log.entry('Guessing')
    // processGuessingPhase()
    log.end()
    log = null
    revealSolution()
}

function setPresetCells(){
    cells.forEach((c) => {
        if (!isNaN(parseInt(c.value))) {
            c.setAttribute('data-preset',c.value)
            c.setAttribute('disabled','true')
        }
    })
}

function setForcedCells(pseudo = false){
    // console.log('setForcedCells')
    let continuePhase = true
    while(continuePhase){
        clearAttribute('data-possibilities')
        setPossibilities()
        let possibilities = document.querySelectorAll('[data-possibilities]')
        let forcedCellCount = 0
        possibilities.forEach((c) => {
            if(processForcedCell(c,pseudo)) forcedCellCount++
        })
        continuePhase = forcedCellCount > 0
    }
}

function setPossibilities(){
    // console.log('setPossibilities')
    cells.forEach((c) => {
        if (!c.dataset.preset && !c.dataset.forced && !c.dataset.pseudo_forced) {
            setCellPossibilities(c)
        }
    })
}

function setCellPossibilities(cell) {
    // console.log('setCellPossibilities')
    let areas = ['row','column','region']
    let matrixSet = getMatrixSet()
    areas.forEach((a) => {
        let areaCells = document.querySelectorAll(`[data-${a}='${cell.dataset[a]}']`)
        getPossibilities(areaCells,matrixSet)
    })
    // console.log(matrixSet)
    cell.setAttribute('data-possibilities',JSON.stringify(matrixSet))
}

function processForcedCell(cell,pseudo = false) {
    // console.log('processForcedCell')
    continueRecusiveGuessing = true
    let attribute = pseudo ? 'data-pseudo_forced' : 'data-forced'
    // console.log(attribute)
    let poss = JSON.parse(cell.dataset.possibilities)
    // console.log(poss)
    if (poss.length === 1){
        cell.setAttribute(attribute,poss[0])
        // forcedCellIds.push(cell.getAttribute('id'))
        return true
    } else if (poss.length === 0 && !pseudo){
        let id = cell.getAttribute('id')
        alert(`The puzzle is unsolvable because cell ${id} had no possiblities!`)
    } else if (poss.length === 0 && pseudo){
        continueRecusiveGuessing = false
    }
    return false
}

function getMatrixSet(){
    // console.log('getMatrixSet')
    let result = []
    for (let i = 1; i <= matrix**2; i++) {
        result.push(`${i}`)
    }
    return result
}

function getPossibilities(areaCells,matrixSet){
    // console.log('getPossibilities')
    areaCells.forEach((c) => {
        if(c.dataset.preset && matrixSet.includes(c.dataset.preset)){
            let i = matrixSet.findIndex((e) => e === `${c.dataset.preset}`)
            matrixSet.splice(i,1)
        }
        if(c.dataset.forced && matrixSet.includes(c.dataset.forced)){
            let i = matrixSet.findIndex((e) => e === `${c.dataset.forced}`)
            matrixSet.splice(i,1)
        }
        if(c.dataset.guess && matrixSet.includes(c.dataset.guess)){
            let i = matrixSet.findIndex((e) => e === `${c.dataset.guess}`)
            matrixSet.splice(i,1)
        }
        if(c.dataset.pseudo_forced && matrixSet.includes(c.dataset.pseudo_forced)){
            let i = matrixSet.findIndex((e) => e === `${c.dataset.pseudo_forced}`)
            matrixSet.splice(i,1)
        }
    })
}

function processGuessingPhase(depth = 0){
    // console.log(`processGuessingPhase ${depth}`)
    clearAttribute('data-possibilities')
    setForcedCells(true)
    setPossibilities()
    
    let openCells = getOpenCells()
    // console.log(openCells.length)
    // return
    if (openCells.length === 0){
        // the puzzle is solved
        return
    } else if (openCells.length > 0){
        doGuess(openCells[0])
        // console.log(openCells.length)
        stack.push(new Entry(openCells))
        // console.log(stack)
        // console.log(openCells.length)
        processGuessingPhase(depth++)
    } else {
        undoGuess()
        processGuessingPhase(depth--)
    }
}

function getOpenCells(){
    // console.log('getOpenCells')
    let openCells = []
    cells.forEach((c) => {
        // let p = false
        if (c.dataset.possibilities){
            if (JSON.parse(c.dataset.possibilities).length > 0){
                // console.log('open cell with no possibilities!')
                if (!c.dataset.preset && !c.dataset.forced && !c.dataset.guess && !c.dataset.pseudo_forced) openCells.push(c)
            }
        }
        // if (!c.dataset.preset && !c.dataset.forced && !c.dataset.guess && !c.dataset.pseudo_forced && p) openCells.push(c)
    })
    return openCells
}

function doGuess(cell){
    console.log('doGuess')
    let p = JSON.parse(cell.dataset.possibilities)
    console.log(p)
    let g = cell.dataset.guesses ? JSON.parse(cell.dataset.guesses) : []
    console.log(g)
    if (p.length >= g.length) {
        // console.log(cell.getAttribute('id'))
        // console.log(`possibilities:${p} guesses:${g}`)
        countOfGuesses++
        // console.log(countOfGuesses)
        cell.setAttribute('data-guess',p[g.length])
        g.push(p[g.length])
        cell.setAttribute('data-guesses',JSON.stringify(g))
    }
    // console.log(g)
}

function undoGuess(){
    console.log('undoGuess')
    if (stack.length > 0){
        let entry = stack.pop()
        entry.openCells.forEach((data) => {
            let c = document.getElementById(data.id)
            c.setAttribute('data-guesses',data.guesses)
        })
        let c = document.getElementById(entry.guessCell.id)
        c.setAttribute('data-guesses',entry.guessCell.guesses)
        c.setAttribute('data-possibilities',entry.guessCell.possibilities)
    } else {
        alert('ERROR:\nThe stack is empty and we are trying to undo a guess!\nThe puzzle must be impossible to solve.')
    }
}

function revealSolution(){
    // console.log('revealSolution')
    cells.forEach((c) => {
        if (!c.dataset.preset) {        
            revealValue(c)
        }
    })
}

function revealValue(cell){
    // console.log('revealValue')
    if (cell.dataset.forced){
        cell.value = cell.dataset.forced
    } else if (cell.dataset.guess) {
        cell.value = cell.dataset.guess
    } else if (cell.dataset.pseudo_forced){
        cell.value = cell.dataset.pseudo_forced
    } else {
        // throw `Error when revealing solution. Cell ${cell.id} has no forced or guess value!`
    }
}

//#endregion

//#region Reused Functions

function clearAttribute(attribute){
    cells.forEach((c) => {
        c.removeAttribute(attribute)
    })
}

function clearValues(){
    cells.forEach((c) => {
        c.value = null
    })
}

function clearStyles(){
    cells.forEach((c) => {
        c.setAttribute('class','cell')
    })
}

//#endregion

class Entry{
    constructor(openCells = []){
        this.guessCell = {
            id: openCells[0].getAttribute('id'),
            guesses: openCells[0].dataset.guesses,
            possibilities: openCells[0].dataset.possibilities
        }
        this.openCells = []
        this.processOpenCells(openCells)
    }
    processOpenCells(elements){
        elements.splice(0,1)
        elements.forEach((e) => {
            this.openCells.push({
                id: e.getAttribute('id'),
                guesses: e.dataset.guesses,
                // possibilities: e.dataset.possibilities
            })
        })
    }
}
