

export async function verificaMsg(driver) {
    try {
        // Aguarda até que o elemento com a mensagem apareça (máximo de 10 segundos)
        const elementoMensagem = await driver.wait(
            until.elementLocated(By.css('.mt-dialog-content.containerElement')), // Localiza o elemento pela classe
            10000 // Tempo máximo de espera (10 segundos)
        );

        // Aguarda o elemento se tornar visível
        await driver.wait(until.elementIsVisible(elementoMensagem), 5000);

        // Obtém o texto do elemento
        const textoMensagem = await elementoMensagem.getText();

        if (textoMensagem.includes('Esta nota fiscal já foi digitada'))
            return ('Nota fiscal já foi digitada. A execução foi interrompida.');
        else if(textoMensagem.includes('A quantidade informada é superior à quantia que sua loja comprou deste item da Tramontina'))
            return('Quantidade do item superior ao comprado.');
        
    } catch (err) {
        if (!(err.name === 'TimeoutError')) {
            return false; // Relança outros erros para o tratamento geral
        }
    }
}