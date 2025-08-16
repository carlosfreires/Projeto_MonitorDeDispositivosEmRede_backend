# Monitor EQP - API de Monitoramento e Gestão de Equipamentos

## Descrição

API REST para monitoramento de equipamentos (ping, telnet, tracert). Possui gestão de usuários, sessões e solicitações de acesso.

## Visão Geral

Este repositório implementa uma API REST com padrões de arquitetura *Service → Repository → Model*, middlewares centralizados (CORS, autenticação JWT, JSON parser), tratamento de erros consistente e logs padronizados usando utils/logger.

* Funcionalidades principais:

    * Autenticação JWT (login / logout / sessões)

    * CRUD de usuários e sessões

    * Gerenciamento de equipamentos (cadastrar, listar, atualizar, deletar, listar ativos)

    * Testes de conectividade: Ping, Telnet, Traceroute (execução e persistência)

    * Consolidação de logs de monitoramento (ping + telnet)

    * Fluxo de solicitação de acesso (create/approve/reject)

## Pré-requisitos

* Node.js v16+ (recomendado LTS)

* NPM

* Banco de dados (MySQL/MariaDB, PostgreSQL ou MongoDB) conforme sua implementação em repositories/

    * Observação: os repositórios/DAO do projeto assumem API de persistência que retornam insertId, affectedRows, etc. Ajuste para seu banco (MySQL vs Mongo) conforme necessário.

## Tecnologias

* **Node.js (Express)**: Framework para criação do servidor e APIs RESTful.

* **MySQL**: Banco de dados relacional para armazenamento de dados.

* **JWT**: Implementação de autenticação segura.

* **Ferramentas de Monitoramento**: Ping, Telnet e Tracert para teste de conectividade e diagnóstico.

## Estrutura do Banco de Dados

* **usuarios**: Gerencia informações dos usuários, como nome, email, senha e perfil de acesso.

* **equipamentos**: Registra os dispositivos monitorados, incluindo IP, hostname e status.

* **solicitacoes_acesso**: Armazena solicitações de novos acessos, aguardando aprovação.

* **sessoes**: Monitora as sessões ativas de usuários autenticados.

* **pingtest**: Armazena os resultados de testes de conectividade via Ping.

* **telnet**: Registra os logs de conexões realizadas com Telnet.

* **tracert**: Contém os dados de rastreamento de rota (Tracert).

* **logs_monitoramento**: Centraliza os logs de monitoramento para auditoria.

> ### Diagrama do Banco de Dados
>
> **Diagrama Entidade-Relacionamento (DER)**
>
>Este diagrama representa a estrutura do banco de dados utilizado no projeto.
>![Diagrama Entidade-Relacionamento](documentos/diagramas/erd/diagrama-MySql-monitor_eqp.png)
>
> Você pode visualizar o diagrama interativo do banco de dados aqui:
> [Diagrama do Banco de Dados no dbdocs.io](https://dbdocs.io/freires.carlos/Monitor-EQP-Sistema-de-Monitoramento-de-Equipamentos?view=table_structure)

## Como rodar localmente (Passo a passo)

1. Clone o repositório:

    ```bash
    git clone https://github.com/carlosfreires/Projeto_MonitorDeDispositivosEmRede_backend.git
    cd Projeto_MonitorDeDispositivosEmRede_backend
    ```

2. Instale as dependências do projeto:

    ```bash
    npm install
    ```

3. Crie um arquivo .env e configure as variáveis de ambiente no arquivo .env:

    ```SERVER_PORT=2200
    DB_HOST = seu_host
    DB_USER = seu_usuario
    DB_PASSWORD = sua_senha
    DB_NAME = monitor_eqp
    JWT_SECRET = sua_chave_secreta
    ```

4. Configure o banco de dados e execute o script de criação do banco de dados:

    ```bash
    mysql -u <usuario> -p < schema.sql
    ```

5. Inicie o servidor:

    ```bash
    npm start
    ```

6. Endpoints base (a aplicação monta as rotas em /api):

* Health: GET /health

* Ready: GET /ready

API base: http://localhost:3000/api (ajuste PORT em .env)

## Consulte a documentação da API

>[**clique aqui para acessar a documentação completa**](documentos/documentacao-API/documentacaoAPI.md)

### Diagramas UML

> **Diagrama de classes**
>
>Este diagrama representa a estrutura de classes do sistema.
>![Diagrama de classes (uml)](documentos/diagramas/uml/diagrama-classe-monitor_eqp-azul.png)

> **Diagrama de objetos**
>
>Este diagrama representa a estrutura de classes do sistema.
>![Diagrama de classes (uml)](documentos/diagramas/uml/diagrama-objetos-monitor_eqp-azul.png)


## Logging e Tratamento de Erros

* Logs unificados via utils/logger com níveis: info, warn, error, debug, success.

* Middleware tratamentoDeErros padroniza respostas de erro JSON e evita vazar stack traces em produção.

## Licença

**Este projeto é licenciado sob a MIT License.**