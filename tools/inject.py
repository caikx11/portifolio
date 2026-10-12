import sys,re
n=sys.argv[1]; fonts=sys.argv[2]
p=f'project_{n}/index.html'; s=open(p).read()
if 'theme.css' not in s:
    s=s.replace('</head>',f'    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link href="https://fonts.googleapis.com/css2?family={fonts}&display=swap" rel="stylesheet">\n    <link rel="stylesheet" href="css/theme.css">\n</head>',1)
if 'back-link' not in s:
    s=re.sub(r'<body([^>]*)>',r'<body\1>\n    <a class="back-link" href="../projetos.html">← Portfólio</a>',s,1)
open(p,'w').write(s)
