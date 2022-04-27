#[ADR-0002] Signer ID VS Codice Fiscale

## Data: 2022-04-26

## Stato Proposto

##Contesto

Abbiamo bisogno di un identificativo univoco per il SIGNER che possa identificare tutte le operazioni effettuate da un singolo USER memorizzate nel DB.

# Decisione

## Opzione 1

Usiamo un codice identificativo proprietario del servizio

## Opzione 2

Usiamo il Codice Fiscale del SIGNER

# Decisione

## Opzione 1

###PRO:
* la possibilità di cambiare identificativo nel caso in cui cambiasse il provider di firma;
* la possibilità di cambiare identificativo nel caso in cui cambiasse la clausola del servizio;
* la possibilità, in caso di cambio codice fiscale, di poter recuperare tutte le operazioni effettuate dallo stesso SIGNER  potendo cambiare il suddetto codice fiscale in un'unica entità;
* la possibilità di creare entità più granulari.

###CONTRO:
* la creazione di un'API dedicata per recuperare i SignerID a partire da un certo Codice Fiscale;
* una maggiore complessità nel raggruppare i dati legati ad un singolo SIGNER.

## Opzione 2

###PRO:
* non c'è bisogno di API ad hoc visto che il codice fiscale è un dato conosciuto da tutti gli interessati (app, issuer e qtsp);
* i dati sarebbero connessi allo stesso SIGNER in maniera del tutto semplificata.

###CONTRO:
* l'estrema difficoltà nel mantenere uno storico delle operazioni effettuate da un SIGNER in caso di cambio codice fiscale;
* entità molto complesse per gestire tutti i cambiamenti che potrebbero avvenire nel tempo (cambio di provider di Firma, cambio di clausole del servizio ... ).

#Soluzione

#UX

#Scalabilità

#Autonomia

#Adattabilità

#Sicurezza

#Semplicità




Nel contesto <use case/user story>, risolvendo la problematica <problematica> abbiamo deciso di <opzione scelta> e scartato <altra opzione>, per ottenere <parametri di qualità / requisiti soddisfatti>, accettando che <svantaggi>, poiché <motivazione>.

Consequenze

Descrivi le conseguenze della decisione.