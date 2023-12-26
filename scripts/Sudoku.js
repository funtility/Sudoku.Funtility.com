class SudokuPuzzle
{
    constructor(data = {})
    {
        this.matrix = data.hasOwnProperty('matrix') ? data.matrix : 0
        this.puzzle = data.hasOwnProperty('puzzle') ? data.puzzle : []
        if (this.puzzle.length > 0) 
        {
            if(this.matrix === 0) this.matrix = Math.sqrt(Math.sqrt(puzzle.length))
            this.makeGrid();
        }
        else
        {
            this.matrix = 3
            this.makeGrid();
        }
    }

    //#region Make empty puzzle
    
    makeGrid() {
        // console.log('> makeGrid')
        for (let i = 1; i <= this.matrix; i++) {
            let subGridRowStartNum = (i - 1) * this.matrix
            this.makeSubGridRow(subGridRowStartNum)
        }
    }
        
    makeSubGridRow(subGridRowStartNum) {
        // console.log('> makeSubGridRow')
        for (let i = 1; i <= matrix; i ++) {
            this.makeSubGrid(subGridRowStartNum,subGridRowStartNum + i)
        }
    }
    
    makeSubGrid(subGridRowStartNum,subGridNum) {
        // console.log('> makeSubGrid')
        for (let i = 1; i <= matrix; i++) {
            let rowNum = subGridRowStartNum + i
            this.makeCellRow(subGridNum,rowNum)
        }
    }
    
    makeCellRow(subGridNum,rowNum) {
        // console.log('>> makeCellRow')
        for (let i = 1; i <= matrix; i++) {
            this.puzzle.push({
                "row": rowNum,
                "col": this.getColumnNumber(subGridNum,i),
                "grid": subGridNum,
                "value": null
            })
        }
    }
    
    getColumnNumber(subGridNum,relativeColumnNumber) {
        // console.log('>> getColumnNumber')
        while (subGridNum > matrix) {
            subGridNum = subGridNum - matrix
        }
        return (subGridNum - 1) * matrix + relativeColumnNumber
    }

    //#endregion

    // getConflictingCells(row,col,value,puzzle = this.puzzle)
    // {
    //     //find the grid
    //     let grid = this.getGridNumOfCell(row,col,puzzle)
    //     let rowCells = puzzle.filter(cell => cell.row === row && cell.value === value)
    //     let colCells = puzzle.filter(cell => cell.col === col && cell.value === value)
    //     let gridCells = puzzle.filter(cell => cell.grid === grid && cell.value === value)
    //     return [].concat(rowCells,colCells,gridCells)
    // }

    // getGridNumOfCell(row,col,puzzle)
    // {
    //     let i = this.getCellIndex(row,col,puzzle)
    //     return puzzle[i].grid
    // }

    setValue(row,col,val,puzzle = this.puzzle)
    {
        let i = puzzle.findIndex(cell => cell.row === row && cell.col === col)
        puzzle[i].value = val
    }
}

class SudokuSolver
{
    constructor(data = {})
    {
        this.matrix = data.hasOwnProperty('matrix') ? data.matrix : 3
        this.possibleValues = this.getPossibleValues()

        this.puzzle = data.hasOwnProperty('puzzle') ? data.puzzle : []
        if (this.puzzle.length < 1) throw "No data provided for cells."

        this.puzzleWithForcedCells = data.puzzle
        this.forcedCellsCount = 0

        this.guessStack = []

        this.puzzleWithSolution = []
    }

    getPossibleValues()
    {
        let result = []
        for(let i = 1; i <= this.matrix**2; i++)
        {
            result.push(i)
        }
        return result
    }

    solvePuzzle()
    {
        this.forcedCellsPhase()
        if(this.isPuzzleSolved(this.puzzleWithForcedCells)) alert("Solved!")
        //start guessing
    }

    forcedCellsPhase()
    {
        console.log("forcedCellsPhase")
        let thereWereForcedCells = true
        while(thereWereForcedCells)
        {
            let forcedCells = this.getForcedCells(this.puzzleWithForcedCells)
            this.forcedCellsCount += forcedCells.length
            this.applyForcedCells(forcedCells,this.puzzleWithForcedCells)
            thereWereForcedCells = forcedCells.length > 0
        }
    }

    getForcedCells(puzzle)
    {
        let result = []
        puzzle.forEach(cell => {
            let options = this.getCellOptions(cell,puzzle)
            if (options.length === 1) result.push({
                "col": cell.col,
                "row": cell.row,
                "value": options[0]
            })
        })
        return result
    }

    getCellOptions(cell,puzzle)
    {
        unavailableOptions = []
        puzzle.forEach(c =>
        {
            if (c.value != null)
            {
                if (c.row == cell.row || c.col == cell.col || c.grid == cell.grid) unavailableOptions.push(c.value)
            }
        })
        return this.possibleValues.filter(val => !unavailableOptions.includes(val))
    }

    applyForcedCells(forcedCells,puzzle)
    {
        forcedCells.forEach(f => {
            i = puzzle.findIndex(cell => cell.row === f.row && cell.col === f.col)
            puzzle[i].value = f.value
        })
    }

    isPuzzleSolved(puzzle)
    {
        let nullCells = puzzle.filter(cell => cell.value == null)
        return nullCells.length === 0
    }
}
