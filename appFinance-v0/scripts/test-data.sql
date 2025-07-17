-- Script para inserir dados de teste (opcional)
-- Execute apenas se quiser dados de exemplo

-- Inserir categorias de exemplo
INSERT INTO categories (user_id, name, limit_amount, color) VALUES
  (auth.uid(), 'Alimentação', 800.00, '#10B981'),
  (auth.uid(), 'Transporte', 300.00, '#3B82F6'),
  (auth.uid(), 'Lazer', 400.00, '#8B5CF6'),
  (auth.uid(), 'Saúde', 200.00, '#EF4444'),
  (auth.uid(), 'Educação', 150.00, '#F59E0B');

-- Inserir alguns gastos de exemplo
INSERT INTO expenses (user_id, category_id, amount, description, date) 
SELECT 
  auth.uid(),
  c.id,
  CASE c.name
    WHEN 'Alimentação' THEN 45.50
    WHEN 'Transporte' THEN 12.00
    WHEN 'Lazer' THEN 80.00
    WHEN 'Saúde' THEN 35.00
    WHEN 'Educação' THEN 25.00
  END,
  CASE c.name
    WHEN 'Alimentação' THEN 'Almoço no restaurante'
    WHEN 'Transporte' THEN 'Uber para o trabalho'
    WHEN 'Lazer' THEN 'Cinema com amigos'
    WHEN 'Saúde' THEN 'Farmácia - medicamentos'
    WHEN 'Educação' THEN 'Livro técnico'
  END,
  CURRENT_DATE
FROM categories c
WHERE c.user_id = auth.uid();

-- Inserir contas fixas de exemplo
INSERT INTO fixed_accounts (user_id, name, amount, due_day, month, year, is_paid) VALUES
  (auth.uid(), 'Aluguel', 1200.00, 5, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), false),
  (auth.uid(), 'Internet', 89.90, 10, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), true),
  (auth.uid(), 'Energia Elétrica', 150.00, 15, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), false),
  (auth.uid(), 'Água', 45.00, 20, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE), false);
