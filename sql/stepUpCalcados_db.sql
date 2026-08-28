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

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(200)
);

-- 3. Tabela de Produtos (com a FK de Categoria)
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

-- 4. Tabela de Estoque
CREATE TABLE IF NOT EXISTS estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE
);

-- 5. Tabela de Histórico de Preços
CREATE TABLE IF NOT EXISTS historico_preco (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    preco_anterior DECIMAL(10,2) NOT NULL,
    preco_novo DECIMAL(10,2) NOT NULL,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto) ON DELETE CASCADE
);

-- 6. Tabela de Vendas
CREATE TABLE IF NOT EXISTS venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_funcionario INT NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50),
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);

-- 7. Tabela de Itens da Venda
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

-- ============================================================
--  MIGRAÇÃO: tabela movimentacao_estoque
--  Execute após a criação das tabelas produto, estoque e
--  funcionario já existentes no banco.
-- ============================================================

CREATE TABLE IF NOT EXISTS movimentacao_estoque (
  id_movimentacao   INT           NOT NULL AUTO_INCREMENT,
  id_produto        INT           NOT NULL,
  id_funcionario    INT               NULL,          -- NULL = sistema (venda automática)
  tipo              ENUM('entrada','saida','ajuste') NOT NULL,
  quantidade        INT           NOT NULL,           -- sempre positivo; tipo indica direção
  motivo            VARCHAR(255)      NULL,
  data_movimentacao DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_movimentacao),
  CONSTRAINT fk_mov_produto     FOREIGN KEY (id_produto)     REFERENCES produto(id_produto),
  CONSTRAINT fk_mov_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario),
  CONSTRAINT chk_quantidade     CHECK (quantidade > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices para consultas frequentes
CREATE INDEX idx_mov_produto     ON movimentacao_estoque (id_produto);
CREATE INDEX idx_mov_funcionario ON movimentacao_estoque (id_funcionario);
CREATE INDEX idx_mov_data        ON movimentacao_estoque (data_movimentacao DESC);

-- ============================================================
--  TRIGGER: registra saída automática ao confirmar venda
--  Dispara após cada linha inserida em item_venda.
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_venda_saida_estoque
AFTER INSERT ON item_venda
FOR EACH ROW
BEGIN
  INSERT INTO movimentacao_estoque
    (id_produto, id_funcionario, tipo, quantidade, motivo)
  VALUES (
    NEW.id_produto,
    (SELECT id_funcionario FROM venda WHERE id_venda = NEW.id_venda),
    'saida',
    NEW.quantidade,
    CONCAT('Venda #', NEW.id_venda)
  );
END$$

-- ============================================================
--  TRIGGER: registra entrada automática ao cancelar venda
--  Dispara após cada linha removida de item_venda.
-- ============================================================

CREATE TRIGGER trg_venda_cancelamento_estoque
AFTER DELETE ON item_venda
FOR EACH ROW
BEGIN
  INSERT INTO movimentacao_estoque
    (id_produto, id_funcionario, tipo, quantidade, motivo)
  VALUES (
    OLD.id_produto,
    (SELECT id_funcionario FROM venda WHERE id_venda = OLD.id_venda),
    'entrada',
    OLD.quantidade,
    CONCAT('Cancelamento da venda #', OLD.id_venda)
  );
END$$

DELIMITER ;
