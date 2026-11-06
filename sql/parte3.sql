-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS sistema_agendamento;
USE sistema_agendamento;

-- 1. Tabela Cliente
CREATE TABLE Cliente (
    id_cliente INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(200) NOT NULL,
    senha VARCHAR(200) NOT NULL,
    telefone VARCHAR(100),
    email VARCHAR(100)
);

-- 2. Tabela Usuario
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(200) NOT NULL
);

-- 3. Tabela Veiculo (Possui chave estrangeira para Cliente)
CREATE TABLE Veiculo (
    id_veiculo INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    ano INT,
    placa VARCHAR(50),
    CONSTRAINT fk_veiculo_cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

-- 4. Tabela Agendamento (Possui chave estrangeira para Veiculo e Usuario)
CREATE TABLE Agendamento (
    id INT PRIMARY KEY,
    id_veiculo INT NOT NULL,
    id_usuario INT,
    data_agendamento DATE,
    servico VARCHAR(200),
    CONSTRAINT fk_agendamento_veiculo FOREIGN KEY (id_veiculo) REFERENCES Veiculo(id_veiculo),
    CONSTRAINT fk_agendamento_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);