// Cruzadas pré-montadas (sem conflitos de interseção), geradas e validadas offline.
const PUZZLES = {
 "fácil": [
  [
   {
    "word": "PATO",
    "clue": "Ave que faz quá",
    "row": 3,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "CASA",
    "clue": "Lugar onde se vive",
    "row": 0,
    "col": 1,
    "dir": "down"
   },
   {
    "word": "MAR",
    "clue": "Grande massa de água salgada",
    "row": 1,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "ROSA",
    "clue": "Flor de espinhos",
    "row": 2,
    "col": 3,
    "dir": "down"
   },
   {
    "word": "SOL",
    "clue": "Estrela que ilumina o dia",
    "row": 4,
    "col": 3,
    "dir": "across"
   },
   {
    "word": "RIO",
    "clue": "Corrente de água doce",
    "row": 2,
    "col": 3,
    "dir": "across"
   },
   {
    "word": "LUA",
    "clue": "Satélite natural da Terra",
    "row": 4,
    "col": 5,
    "dir": "down"
   },
   {
    "word": "BOLA",
    "clue": "Redonda, usada no futebol",
    "row": 5,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "PAO",
    "clue": "Alimento feito de farinha",
    "row": 0,
    "col": 5,
    "dir": "down"
   }
  ],
  [
   {
    "word": "ROSA",
    "clue": "Flor de espinhos",
    "row": 3,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "BOLA",
    "clue": "Redonda, usada no futebol",
    "row": 0,
    "col": 3,
    "dir": "down"
   },
   {
    "word": "LUA",
    "clue": "Satélite natural da Terra",
    "row": 2,
    "col": 3,
    "dir": "across"
   },
   {
    "word": "GATO",
    "clue": "Felino doméstico que mia",
    "row": 1,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "MAR",
    "clue": "Grande massa de água salgada",
    "row": 1,
    "col": 5,
    "dir": "down"
   },
   {
    "word": "SAPO",
    "clue": "Anfíbio que coaxa",
    "row": 3,
    "col": 2,
    "dir": "down"
   },
   {
    "word": "PAO",
    "clue": "Alimento feito de farinha",
    "row": 5,
    "col": 2,
    "dir": "across"
   },
   {
    "word": "RIO",
    "clue": "Corrente de água doce",
    "row": 3,
    "col": 0,
    "dir": "down"
   },
   {
    "word": "SOL",
    "clue": "Estrela que ilumina o dia",
    "row": 4,
    "col": 4,
    "dir": "down"
   }
  ],
  [
   {
    "word": "PATO",
    "clue": "Ave que faz quá",
    "row": 1,
    "col": 1,
    "dir": "across"
   },
   {
    "word": "GATO",
    "clue": "Felino doméstico que mia",
    "row": 0,
    "col": 2,
    "dir": "down"
   },
   {
    "word": "AMOR",
    "clue": "Sentimento de carinho",
    "row": 3,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "SOL",
    "clue": "Estrela que ilumina o dia",
    "row": 0,
    "col": 4,
    "dir": "down"
   },
   {
    "word": "MAR",
    "clue": "Grande massa de água salgada",
    "row": 2,
    "col": 0,
    "dir": "down"
   },
   {
    "word": "LUA",
    "clue": "Satélite natural da Terra",
    "row": 2,
    "col": 4,
    "dir": "across"
   },
   {
    "word": "RIO",
    "clue": "Corrente de água doce",
    "row": 3,
    "col": 3,
    "dir": "down"
   },
   {
    "word": "PAO",
    "clue": "Alimento feito de farinha",
    "row": 5,
    "col": 1,
    "dir": "across"
   },
   {
    "word": "SAPO",
    "clue": "Anfíbio que coaxa",
    "row": 1,
    "col": 6,
    "dir": "down"
   }
  ]
 ],
 "médio": [
  [
   {
    "word": "ARQUIVO",
    "clue": "Documento guardado no disco",
    "row": 1,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "CODIGO",
    "clue": "Texto escrito por quem programa",
    "row": 0,
    "col": 6,
    "dir": "down"
   },
   {
    "word": "MOUSE",
    "clue": "Aponta e clica na tela",
    "row": 5,
    "col": 5,
    "dir": "across"
   },
   {
    "word": "DADOS",
    "clue": "Informações coletadas para análise",
    "row": 0,
    "col": 0,
    "dir": "down"
   },
   {
    "word": "SITE",
    "clue": "Página na internet",
    "row": 3,
    "col": 5,
    "dir": "across"
   },
   {
    "word": "TELA",
    "clue": "Mostra a imagem do computador",
    "row": 4,
    "col": 9,
    "dir": "down"
   },
   {
    "word": "BUG",
    "clue": "Erro em um programa",
    "row": 0,
    "col": 3,
    "dir": "down"
   },
   {
    "word": "PROGRAMA",
    "clue": "Conjunto de instruções para o computador",
    "row": 7,
    "col": 2,
    "dir": "across"
   },
   {
    "word": "SENHA",
    "clue": "Protege sua conta",
    "row": 4,
    "col": 0,
    "dir": "across"
   }
  ],
  [
   {
    "word": "PROGRAMA",
    "clue": "Conjunto de instruções para o computador",
    "row": 3,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "MOUSE",
    "clue": "Aponta e clica na tela",
    "row": 3,
    "col": 6,
    "dir": "down"
   },
   {
    "word": "BUG",
    "clue": "Erro em um programa",
    "row": 5,
    "col": 5,
    "dir": "across"
   },
   {
    "word": "SITE",
    "clue": "Página na internet",
    "row": 7,
    "col": 3,
    "dir": "across"
   },
   {
    "word": "TELA",
    "clue": "Mostra a imagem do computador",
    "row": 0,
    "col": 7,
    "dir": "down"
   },
   {
    "word": "DADOS",
    "clue": "Informações coletadas para análise",
    "row": 0,
    "col": 2,
    "dir": "down"
   },
   {
    "word": "REDE",
    "clue": "Conjunto de dispositivos conectados",
    "row": 1,
    "col": 6,
    "dir": "across"
   },
   {
    "word": "CODIGO",
    "clue": "Texto escrito por quem programa",
    "row": 0,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "SENHA",
    "clue": "Protege sua conta",
    "row": 0,
    "col": 9,
    "dir": "down"
   }
  ],
  [
   {
    "word": "PROGRAMA",
    "clue": "Conjunto de instruções para o computador",
    "row": 4,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "REDE",
    "clue": "Conjunto de dispositivos conectados",
    "row": 4,
    "col": 1,
    "dir": "down"
   },
   {
    "word": "DADOS",
    "clue": "Informações coletadas para análise",
    "row": 3,
    "col": 5,
    "dir": "down"
   },
   {
    "word": "SENHA",
    "clue": "Protege sua conta",
    "row": 0,
    "col": 7,
    "dir": "down"
   },
   {
    "word": "SITE",
    "clue": "Página na internet",
    "row": 1,
    "col": 4,
    "dir": "across"
   },
   {
    "word": "CODIGO",
    "clue": "Texto escrito por quem programa",
    "row": 6,
    "col": 4,
    "dir": "across"
   },
   {
    "word": "TELA",
    "clue": "Mostra a imagem do computador",
    "row": 7,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "ARQUIVO",
    "clue": "Documento guardado no disco",
    "row": 0,
    "col": 9,
    "dir": "down"
   },
   {
    "word": "BUG",
    "clue": "Erro em um programa",
    "row": 2,
    "col": 3,
    "dir": "down"
   }
  ]
 ],
 "difícil": [
  [
   {
    "word": "ECOSSISTEMA",
    "clue": "Comunidade de seres e seu ambiente",
    "row": 6,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "ASTRONOMIA",
    "clue": "Estudo dos corpos celestes",
    "row": 2,
    "col": 2,
    "dir": "down"
   },
   {
    "word": "ARQUITETURA",
    "clue": "Arte de projetar e edificar construções",
    "row": 0,
    "col": 8,
    "dir": "down"
   },
   {
    "word": "QUIMICA",
    "clue": "Estuda a composição da matéria",
    "row": 0,
    "col": 2,
    "dir": "across"
   },
   {
    "word": "ATMOSFERA",
    "clue": "Camada de gases que envolve a Terra",
    "row": 2,
    "col": 4,
    "dir": "down"
   },
   {
    "word": "TELESCOPIO",
    "clue": "Instrumento para ver astros distantes",
    "row": 2,
    "col": 6,
    "dir": "down"
   },
   {
    "word": "ENERGIA",
    "clue": "Capacidade de realizar trabalho",
    "row": 4,
    "col": 0,
    "dir": "down"
   },
   {
    "word": "ENGENHARIA",
    "clue": "Aplica ciência para construir soluções",
    "row": 0,
    "col": 10,
    "dir": "down"
   }
  ],
  [
   {
    "word": "ECOSSISTEMA",
    "clue": "Comunidade de seres e seu ambiente",
    "row": 6,
    "col": 1,
    "dir": "across"
   },
   {
    "word": "ENGENHARIA",
    "clue": "Aplica ciência para construir soluções",
    "row": 0,
    "col": 11,
    "dir": "down"
   },
   {
    "word": "ATMOSFERA",
    "clue": "Camada de gases que envolve a Terra",
    "row": 0,
    "col": 9,
    "dir": "down"
   },
   {
    "word": "FISICA",
    "clue": "Estuda movimento, energia e forças",
    "row": 8,
    "col": 4,
    "dir": "across"
   },
   {
    "word": "ARQUITETURA",
    "clue": "Arte de projetar e edificar construções",
    "row": 0,
    "col": 1,
    "dir": "down"
   },
   {
    "word": "ASTRONOMIA",
    "clue": "Estudo dos corpos celestes",
    "row": 10,
    "col": 1,
    "dir": "across"
   },
   {
    "word": "QUIMICA",
    "clue": "Estuda a composição da matéria",
    "row": 2,
    "col": 1,
    "dir": "across"
   },
   {
    "word": "BIOLOGIA",
    "clue": "Ciência dos seres vivos",
    "row": 4,
    "col": 0,
    "dir": "across"
   }
  ],
  [
   {
    "word": "ECOSSISTEMA",
    "clue": "Comunidade de seres e seu ambiente",
    "row": 6,
    "col": 0,
    "dir": "across"
   },
   {
    "word": "GEOMETRIA",
    "clue": "Ramo da matemática das formas",
    "row": 2,
    "col": 8,
    "dir": "down"
   },
   {
    "word": "ASTRONOMIA",
    "clue": "Estudo dos corpos celestes",
    "row": 4,
    "col": 2,
    "dir": "across"
   },
   {
    "word": "QUIMICA",
    "clue": "Estuda a composição da matéria",
    "row": 10,
    "col": 2,
    "dir": "across"
   },
   {
    "word": "ENERGIA",
    "clue": "Capacidade de realizar trabalho",
    "row": 8,
    "col": 5,
    "dir": "across"
   },
   {
    "word": "ARQUITETURA",
    "clue": "Arte de projetar e edificar construções",
    "row": 0,
    "col": 0,
    "dir": "down"
   },
   {
    "word": "BIOLOGIA",
    "clue": "Ciência dos seres vivos",
    "row": 2,
    "col": 3,
    "dir": "across"
   },
   {
    "word": "ALGORITMO",
    "clue": "Sequência de passos para resolver um problema",
    "row": 0,
    "col": 0,
    "dir": "across"
   }
  ]
 ]
};
