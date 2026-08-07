const ProdutoRepository = require('../repositories/produtoRepository')

class ProdutoService{

async criarProduto(dados){
    let {nome, descricao, preco_venda, preco_custo, tamanho, cor, genero} = dados

    if (preco_venda <= 0 || preco_custo <= 0) {
            throw { status: 400, mensagem: "Preço deve ser um número positivo" };
        }

    if (!nome || !cor || preco_venda === undefined || preco_custo === undefined || tamanho === undefined){
        throw { status: 400, mensagem: "Nome, cor, preço de venda, preço de custo e tamanho são obrigatórios"};
    }

    if (isNaN(preco_venda) || isNaN(preco_custo) || isNaN(tamanho)){
        throw {status: 400, mensagem:"Preço de venda, preço de custo e tamanho devem ser números"};
    }

    const novoProduto = {
        nome, descricao, preco_venda, preco_custo, tamanho, cor, genero 
    }

    const id = await ProdutoRepository.criar(novoProduto)

    return {
            sucesso: true,
            mensagem: "Produto cadastrado com sucesso",
            id
        };
}

}




module.exports = new ProdutoService();