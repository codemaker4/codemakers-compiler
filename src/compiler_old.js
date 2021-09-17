let codeInput;
let lineNumbers;

window.onload = () => {
    codeInput = document.getElementsByClassName("input")[0];
    lineNumbers = document.getElementsByClassName("lineNumbers")[0];

    codeInput.addEventListener('input', () => {
        let inputCode = codeInput.innerText;
        lineNumbers.innerHTML = "";
        let compileStep1 = [];

        let i = 0;
        let loopState = "newLine";
        let labelsToHere = [];
        let errorText = "An error has been detected, but no message was specified. This is a bug. Contact CodeMaker_4";
        let errorHappened = false;

        while (i < inputCode.length) {
            console.log(i, loopState);
            switch (loopState) {
                case "newLine":
                    if (inputCode[i] == " " || inputCode[i] == "    " || inputCode[i] == "\n") { // ingnore tabs, spaces and empty lines
                        i++
                    } else if (inputCode[i] == "-") { // ignore comments
                        loopState = "toNextLine";
                        i++
                    } else if (inputCode[i] == ":") { // label
                        loopState = "parseLabel";
                        i++
                    } else if ('#$%'.includes(inputCode[i])) { // value
                        loopState = "parseValue";
                    } else if (inputCode[i] == "@") { // pointer
                        loopState = "parsePointer";
                        i++
                    } else if (/[A-Z]/.test(inputCode[i])) { // instruction
                        loopState = "parseInstruction"; // TODO
                    } else {
                        loopState = "markError";
                        errorText = "Invalid character at beginning of line"
                        if (/[a-z]/.test(inputCode[i])) {
                            errorText += ": lowercase character. Tip: Instructions are in caps lock, and comments must begin with a -.";
                        } else if (/[0-9]/.test(inputCode[i])) {
                            errorText += ": number. Tip: If you want to store a constant value, place a # before the number to write a decimal number."
                        } else {
                            errorText += ". Tip: Begin the line with a - to make a comment, or with an instruction, a label or a value."
                        }
                    }
                    break;


                case "toNextLine":
                    while (inputCode[i] !== "\n" && i < inputCode.length) {
                        i++;
                    }
                    loopState = "newLine";
                    break;


                case "parseLabel":
                    let newLabel = "";
                    while (/[a-zA-Z0-9_]/.test(inputCode[i]) && i < inputCode.length) {
                        newLabel += inputCode[i];
                        i++
                    }
                    if (newLabel.length == 0) {
                        loopState = "markError";
                        errorText = "Invalid label name. Tip: Labels can only have uppercase and lower case letters, numbers and underscores.";
                    } else {
                        labelsToHere.push(newLabel);
                        console.log("Parsed label " + newLabel);
                        loopState = "toNextLine";
                    }
                    break;


                case "parseValue":
                    let value = inputCode[i];
                    let regex = [/[01]/,/[0-9]/,/[0-9a-fA-F]/]["%#$".indexOf(inputCode[i])]; // set regex to correct expression. binary, decimal, hex
                    i++
                    while (regex.test(inputCode[i]) && i < inputCode.length) {
                        value += inputCode[i];
                        i++
                    }
                    if (!/[ \t\n-]/.test(inputCode[i])) {
                        loopState = "markError";
                        errorText = "Invalid character in value definition. Tip: # is for decimal, $ is for hexadecimal, % is for binary. If you want to leave a comment, begin it with a - character."
                    } else {
                        loopState = "toNextLine";
                    }
                    console.log("parsed value " + value);
                    break;
                

                case "parsePointer":
                    let pointerName = "";
                    while (/[a-zA-Z0-9_]/.test(inputCode[i]) && i < inputCode.length) {
                        pointerName += inputCode[i];
                        i++;
                    }
                    if (pointerName.length == 0) {
                        loopState = "markError";
                        errorText = "Invalid pointer name. Tip: Pointers can only have uppercase and lower case letters, numbers and underscores.";
                    } else if (!/[ \t\n-]/.test(inputCode[i])) {
                        loopState = "markError";
                        errorText = "Invald pointer name. Tip: Pointers can only have uppercase and lower case letters, numbers and underscores. Use - to start a comment."
                    } else {
                        console.log("parsed pointer " + pointerName + ".h");
                        console.log("parsed pointer " + pointerName + ".l");
                        loopState = "toNextLine";
                    }
                    break;


                case "parseInstruction":
                    let instruction = "";
                    while (/[A-Z]/.test(inputCode[i]) && i < inputCode.length) {
                        instruction += inputCode[i];
                        i++
                    }
                    if (!/[ \t\n-]/.test(inputCode[i])) {
                        loopState = "markError";
                        errorText = "Invalid character in instruction name. Tip: Instructions are written in caps lock. A list of instructions can be found in the documentation. If you want to write a comment, use a -."
                    } else { // let's parse the instruction
                        if (["HLT","NOP",
                                "LDA","STA","LDB","SWP","LDH","LDL","STH","STL","LDQ","STQ",
                                "JMP","JMPC","JMPZ","PUSH","POP","SUB","RET",
                                "ADD","ADDC","SUB","SUBC","SHL","SHLC","SHR","SHRC",
                                "AND","OR","XOR","NAND","NOR","XNOR","CKSM","CKSMC","INCR","DECR"]
                                .includes(instruction)) {                                             // all no-argument instructions
                            console.log("Parsed instruction" + instruction);
                            loopState = "toNextLine";
                        } else if (instruction == "ADR") {
                            while (/[ \t]/.test(inputCode[i]) && i < inputCode.length) {
                                i++;
                            }
                            if (inputCode[i] == "@") {
                                i++;
                                let j = i;
                                while (/[a-zA-Z0-9_]/.test(inputCode[j]) && j < inputCode.length) {
                                    j++;
                                }
                                if (inputCode[j] == ".") {
                                    loopState = "markError";
                                    errorText = "ADR needs a full pointer, not a half pointer."
                                } else {
                                    loopState = "parsePointer";
                                    i++;
                                    console.log("Parsed instruction ADR");
                                }
                            } else {
                                loopState = "markError";
                                errorText = "Expected @ symbol for pointer name."
                            }
                        } else {
                            loopState = "markError";
                            errorText = "Invalid instruction. Tip: A list of instructions can be found in the documentation. If you want to write a comment, use a -.";
                        }
                    }
                    break;


                case "markError":
                    console.log("Error ar char " + i.toString() + ": " + errorText);
                    errorHappened = true;
                    while (inputCode[i] !== "\n" && i < inputCode.length) {
                        i++;
                    }
                    loopState = "newLine";
                    break


                default:
                    console.log("invalid state " + loopState);
                    i++;
            }
        }
    });
}

class codeLine {
    constructor(text) {
        this.text = text;
        this.labels = [];
        this.binary = "error: unconverted. This is a bug. Contact CodeMaker_4";
    }
    addLabel(labelName) {
        this.labels.push(labelName);
    }
    convertToBin
}