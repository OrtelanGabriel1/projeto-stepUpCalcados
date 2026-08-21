-- drop database stepupcalcados_db;
CREATE DATABASE IF NOT EXISTS stepupcalcados_db;
USE stepupcalcados_db;

CREATE TABLE IF NOT EXISTS funcionario(-- drop database stepupcalcados_db;
CREATE DATABASE IF NOT EXISTS stepupcalcados_db;
USE stepupcalcados_db;

-- 1. Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    tipo_funcionario VARCHAR(100) NOT NULL
);

-- 2. Tabela de Categorias (Nova entidade)
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(200)
);

-- 3. Tabela de Produtos (Atualizada com a FK de Categoria)
CREATE TABLE IF NOT EXISTS produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(200),
    preco_venda DECIMAL(10,2) NOT NULL,
    preco_custo DECIMAL(10,2) NOT NULL,
    tamanho INT NOT NULL,
    cor VARCHAR(100) NOT NULL,
    genero VARCHAR(100),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE SET NULL
);

-- 4. Tabela de Estoque (Nova entidade)
CREATE TABLE IF NOT EXISTS estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE
);

-- 5. Tabela de Histórico de Preços (Nova entidade)
CREATE TABLE IF NOT EXISTS historico_preco (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    preco_anterior DECIMAL(10,2) NOT NULL,
    preco_novo DECIMAL(10,2) NOT NULL,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE
);

-- 6. Tabela de Vendas (Nova entidade)
CREATE TABLE IF NOT EXISTS venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

-- 7. Tabela de Itens da Venda (Relacionamento entre Venda e Produto)
CREATE TABLE IF NOT EXISTS item_venda (
    id_item_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);
id_funcionario INT auto_increment primary KEY,
nome varchar(100) not null,
email varchar (100)not null unique,
senha varchar (100) not null,
tipo_funcionario varchar (100) not null
);

create table if not exists produto(
id_produto INT auto_increment primary KEY,
nome varchar(100) not null,
descricao varchar(200),
preco_venda decimal(10,2) not null,
preco_custo decimal(10,2) not null,
tamanho int not null,
cor varchar (100) not null,
genero varchar (100));
