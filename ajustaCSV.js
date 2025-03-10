const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const lerCSV = require('./lerCSV');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Caminho do arquivo CSV
const filePath = './teste.csv';

// Função para salvar os itens no CSV
async function salvaCSV(itens) {
    const csvWriter = createCsvWriter({
        path: filePath,
        header: Object.keys(itens[0]).map((key) => ({ id: key, title: key })),
        fieldDelimiter: ';',
    });

    await csvWriter.writeRecords(itens);
    console.log(`Arquivo atualizado com sucesso em: ${filePath}`);
}

async function ordenarPorDataENumero(itens) {
    // Função para formatar a data no formato YYYY-MM-DD (caso necessário)
    function formatarData(data) {  
        const [dia, mes, ano] = data.split('.'); // Divide a string no formato DD.MM.YYYY
        return `${ano}-${mes}-${dia}`; // Retorna no formato padrão YYYY-MM-DD
    }
    

    // Ordenação do array
    itens.sort((a, b) => {
        // Converter as datas para o formato padrão e compará-las
        const dataA = new Date(formatarData(a.DATA_EMISSAO));
        const dataB = new Date(formatarData(b.DATA_EMISSAO));

        // Se as datas forem diferentes, priorizar a data (crescente)
        if (dataA - dataB !== 0) {
            return dataA - dataB;
        }

        // Se as datas forem iguais, ordenar por NUMERO_NF (crescente)
        return parseInt(a.NUMERO_NF) - parseInt(b.NUMERO_NF);
    });

    return itens;
}

// Função para processar os itens
async function processaCSV() {
    try {
        // Carregar os itens do CSV
        const itens = await lerCSV(filePath);

        for (let index = 0; index < itens.length; index++) {
            itens[index].QUANTIDADE = parseInt(itens[index].QUANTIDADE);
            itens[index].VALOR_UNIT_VENDA = itens[index].VALOR_UNIT_VENDA.replace('.', '');
            itens[index].REF_PRODUTO = itens[index].REF_PRODUTO.replace('/', '');
            if (index + 1 < itens.length) {
                // Verificar se a próxima linha tem os mesmos valores de NF e REF
                if (
                    itens[index].NUMERO_NF == itens[parseInt(index) + 1].NUMERO_NF &&
                    itens[index].REF_PRODUTO == itens[parseInt(index) + 1].REF_PRODUTO
                ) {
                    // Somar as quantidades
                    itens[index].QUANTIDADE =
                        (parseInt(itens[index].QUANTIDADE) +
                        parseInt(itens[parseInt(index) + 1].QUANTIDADE));

                    // Remover o item duplicado
                    itens.splice((index + 1), 1);

                    // Voltar um índice para reavaliar os próximos itens
                    index--;
                }
            }
        }
        await ordenarPorDataENumero(itens);
        // Salvar o arquivo CSV com os itens atualizados
        await salvaCSV(itens);
    } catch (error) {
        console.error('Erro ao processar o arquivo CSV:', error);
    }
}

processaCSV();