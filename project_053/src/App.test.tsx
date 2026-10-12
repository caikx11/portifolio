import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => localStorage.clear());

test('mostra estado vazio', () => {
  render(<App today="2024-03-01" />);
  expect(screen.getByText(/jardim está vazio/i)).toBeInTheDocument();
});

test('valida nome vazio e duplicado', async () => {
  const u = userEvent.setup();
  render(<App today="2024-03-01" />);
  await u.click(screen.getByRole('button', { name: 'Plantar' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Dê um nome');
  await u.type(screen.getByLabelText('Nome do hábito'), 'Ler');
  await u.click(screen.getByRole('button', { name: 'Plantar' }));
  await u.type(screen.getByLabelText('Nome do hábito'), 'ler');
  await u.click(screen.getByRole('button', { name: 'Plantar' }));
  expect(screen.getByRole('alert')).toHaveTextContent('já tem');
});

test('planta, marca hoje, atualiza sequência e persiste', async () => {
  const u = userEvent.setup();
  const { unmount } = render(<App today="2024-03-01" />);
  await u.type(screen.getByLabelText('Nome do hábito'), 'Meditar');
  await u.click(screen.getByRole('button', { name: 'Plantar' }));
  const item = screen.getByRole('listitem');
  expect(within(item).getByText(/sequência de 0 dias/)).toBeInTheDocument();
  await u.click(within(item).getByRole('button', { name: /em 01\/03 \(hoje\)/ }));
  expect(within(item).getByText(/sequência de 1 dia/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('1 de 1');
  unmount();
  render(<App today="2024-03-01" />);
  expect(screen.getByText(/sequência de 1 dia/)).toBeInTheDocument();
});

test('exclui com confirmação', async () => {
  const u = userEvent.setup();
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  render(<App today="2024-03-01" />);
  await u.type(screen.getByLabelText('Nome do hábito'), 'Correr');
  await u.click(screen.getByRole('button', { name: 'Plantar' }));
  await u.click(screen.getByRole('button', { name: 'Excluir Correr' }));
  expect(screen.getByText(/jardim está vazio/i)).toBeInTheDocument();
});
