# Misc

create identity

show all VCs
issue new VC

create zkp request
show all zkp requests
show single zkp request

prove zkp request (from VC)

verify zkp request

register service provider
delete service provider

---

On-Chain
- fix smart contract
- generate sdk

# MVP
1. Test KYC в виде CLI
- проверка дубликатов заглушка
- шифруем и передаем во владение
- передает 2 did
- NFT
2. Пользователь
  - NFT идентификатор
  - в нем хранится хеш кошелька
  - он не может его удалить
  - на него мы генерируем did
3. удаление запроса


приходит запрос

---

# Roadmap
On-chain
- store proof data on-chain
- generate NFT proof

# Encryption
threshold cryptography
shamir algo (https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing)

# Vocabulary
claim = verifiable credentials
verifiable presentation

# NFT
- did kyc + did holder + date
- encrypted vcred

# expire: 1 day

- client did
-
# Issuer
- many KYC providers
- store on-chain (encrypted by 3 )

# Holder

1. Создается KYC
2. Получили данные, проверили подписи

- хранить инфу в нфт в виде байт?
- можно сразу создавать нфт, потом его обновлять когда прошла верификация

# Приоритет
- circuit generator (off-chain)
- r1cs, ...
- создает админ (пока 1)
- groth16
- trusted setup:
  - генерация очень секретная случайная перменная
    - из нее генериурется 2 паб ключа
    - один для прувера
    - второй для верифаера
    - оба могут быть записаны в НФТ
  - сразу забыть переменную
- Generate Circuit-NFT
- proof generator (off-chain)
- input: circuit, private input (age, location, etc...), public input (current date, min age, etc...)
- output: proof.json (хранить где быстрее) (Proof-NFT)
- verifier (requester) (on-chain)
- input: proof, public data (Germany, current data: 01.03.2023 (for age)),
- verifier (processor) (off-chain)
- mark request as verified
- generate (on-chain, Certificate-NFT)
- delete request


# Albus API (web3)
- Get DID by Wallet
- Prepare: Send Wallet and Rule and Expiry Time (default: 5min)
  - Check is certificate valid
    - true: Return OK
    - false: Check is valid proof
      - true: Generate new verify request
      - false: Check is valid circuit
        - true: Generate new proof
        - false: Failure
- Wait for certificate (wallet+rule+timeout)





# С конца
нужен proof и публичные данные
приходит офф-чейн верифаер
- передается нфт с публичными данные
- делает верифай и обновляет нфт

# Present

1. Передает данные посреднику
2. Посредник шифрует и выдает 3 ключа
3. И он же генериует пруф и засовыввет его в нфт

# Future

1. ZK без трастед сетапа
2. Шифрование данных (с помощь FHE encryption)
3. Получили зашифрованые данные
4. Интерактивный протокол
5. Генерируем хеши данных и сравниваем с теми что у KYC

# 
1. Запрос в контракт, можно ли мне провести tx с этим юзером
2. он смотри есть ли пруф
3. генерирует запрос для нашего оффчейн прувера
4. прувер обрабатывает запрос и создает в оракле инфо



# NFTs
1. (Rule NFT) - Набор правил
- Только легал эйдж
- Только из монако
- Только М
- ...
2. (Circuit NFT) Циркут генератор
- генерирует разные циркуты в зависимости от алгоритма
- (rule_mint, bin_link, format, generator_version, ....)
3. (Client NFT)
-
- может быть много proof NFT
3. (Proof NFT)
- генерится для каждого клиента
- (mint_cirquit, link_proof_json, clint_nft_link)

# Circuit generator (пока 1)
- Из европы
- Возраст > 18 лет
- Может быть json может on-chain аккаунт

# off-chain services
1. encrypter
  - получает данные шифрует и выдает 2-3 ключа
2. issuer
  - сервис который генерит zk proof
3. zk proover
  - делает proof и генерит verify
4. circuit builder
  - пока 3 predefined
    - возраст
    - юрисдикция
    - время действия паспорта
    - не под санкциями (?)
5. groth16 circuit setuper (сервис для трастед сетап)
  - генерит случайное число
  - создает pvk и забывает число


# Sanctions list
...
