-- Valida a estrutura do identificador, não a classificação em catálogo oficial.
-- Mantém TEXT para preservar zeros à esquerda e permite códigos repetidos.
ALTER TABLE "ProdutosQuimicos"
ADD CONSTRAINT "ProdutosQuimicos_numeroONU_formato_check"
CHECK (char_length("numeroONU") = 4
  AND "numeroONU" ~ '^[0-9]{4}$'
  AND "numeroONU" <> '0000');
