const ProdutoRepository = require('../repositories/produtoRepository')

class ProdutoService{

async buscarTodosProduto(){
    const produtos = ProdutoRepository.buscarTodos()
    return {
        sucesso: true,
        dados: produtos
    }
}

async buscarProdutoPorId(id){
    if (id === undefined || isNaN(id)){
        throw {status: 400, mensagem:"id é obrigatório e deve ser um número"}
    }
    const produto = await ProdutoRepository.buscarPorId(id)
    if (!produto){
        throw {status: 404, mensagem:"Produto não encontrado"}
    }

    return{
        sucesso: true,
        dados: produto
    }
}

async criarProduto(dados){
    let {nome, descricao, preco_venda, preco_custo, tamanho, cor, genero} = dados

    if (!nome || !cor || preco_venda === undefined || preco_custo === undefined || tamanho === undefined){
        throw { status: 400, mensagem: "Nome, cor, preço de venda, preço de custo e tamanho são obrigatórios"};
    }

    if (isNaN(preco_venda) || isNaN(preco_custo) || isNaN(tamanho)){
        throw {status: 400, mensagem:"Preço de venda, preço de custo e tamanho devem ser números"};
    }
    if (preco_venda <= 0 || preco_custo <= 0) {
            throw { status: 400, mensagem: "Preço deve ser um número positivo" };
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