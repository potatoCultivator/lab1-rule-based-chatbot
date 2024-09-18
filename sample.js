const str = "if temperature is greater than 37 then fever";

separate_ante_conse(str);

function separate_ante_conse(str){
    const [antecedent,consequent] = str.split('then').map(part => part.trim());

    console.log(antecedent);
    console.log(consequent);
}