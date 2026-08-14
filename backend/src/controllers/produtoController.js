const ProdutoService = require('../services/produtoService')

class ProdutoController{
async listar (req, res){
    try {
        const resultado = await ProdutoService.buscarTodosProduto()
        res.json(resultado)
    } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno do servidor"
            });
        }
}

async buscarPorId (req, res){
    try {
            const resultado = await ProdutoService.buscarProdutoPorId(req.params.id);
            res.json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno do servidor",
            });
        }
}

async cadastrar(req, res) {
    try {
        const resultado = await ProdutoService.criarProduto(req.body);
        res.status(201).json(resultado);
    } catch (erro) {
        res.status(erro.status || 500).json({
            sucesso: false,
            mensagem: erro.mensagem || "Erro interno do servidor",
        });
    }
}

async atualizar(req, res) {
    try {
        const resultado = await ProdutoService.atualizarProduto(req.params.id, req.body);
        res.json(resultado);
    } catch (erro) {
        res.status(erro.status || 500).json({
            sucesso: false,
            mensagem: erro.mensagem || "Erro interno do servidor",
        });
    }
}

async deletar(req, res) {
    try {
        const resultado = await ProdutoService.deletarProduto(req.params.id);
        res.json(resultado);
    } catch (erro) {
        res.status(erro.status || 500).json({
            sucesso: false,
            mensagem: erro.mensagem || "Erro interno do servidor",
        });
    }
}
}

module.exports = new ProdutoController();