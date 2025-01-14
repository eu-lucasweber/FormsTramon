const lerCSV = require('./lerCSV');

(async () => {
    try {
        const filePath = './teste.csv'; // Substitua pelo caminho do seu arquivo CSV
        const itens = await lerCSV(filePath);

        // Exemplo de uso dos itens
        console.log(itens[0]);
    } catch (error) {
        console.error('Erro ao processar os itens do CSV:', error);
    }
})();
