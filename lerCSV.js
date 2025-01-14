const fs = require('fs');
const csv = require('csv-parser');

async function lerCSV(filePath) {
    return new Promise((resolve, reject) => {
        const itens = [];
        
        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (row) => {
                itens.push(row); // Cada linha do CSV é adicionada ao array de itens
            })
            .on('end', () => {
                console.log('Arquivo CSV lido com sucesso.');
                resolve(itens); // Retorna os itens após a leitura completa
            })
            .on('error', (error) => {
                console.error('Erro ao ler o arquivo CSV:', error);
                reject(error); // Rejeita a promessa em caso de erro
            });
    });
}

module.exports = lerCSV;