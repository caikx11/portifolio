// Cada snippet é HTML + classes Tailwind literais: o mesmo texto é renderizado na prévia e copiado.
export const VARIANTS = {
  primary: "bg-cobalt text-white hover:bg-cobalt-dark",
  accent: "bg-tang text-white hover:brightness-110",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
  soft: "bg-cobalt-soft text-cobalt-dark hover:bg-cobalt/20",
  ghost: "text-ink hover:bg-ink/10",
} as const;
export const SIZES = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-base", lg: "px-7 py-3.5 text-lg" } as const;
export type Variant = keyof typeof VARIANTS;
export type Size = keyof typeof SIZES;

export const button = (v: Variant, s: Size, disabled: boolean, label = "Botão") =>
  `<button type="button" class="inline-flex items-center justify-center rounded-full font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${SIZES[s]} ${VARIANTS[v]}"${disabled ? " disabled" : ""}>${label}</button>`;

export const badges = `<div class="flex flex-wrap gap-2">
  <span class="rounded-full bg-cobalt-soft px-3 py-1 text-xs font-bold text-cobalt-dark">Novo</span>
  <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Ativo</span>
  <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Pendente</span>
  <span class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Erro</span>
  <span class="rounded-full border border-ink px-3 py-1 text-xs font-bold">Contorno</span>
</div>`;

export const alerts = `<div class="space-y-2">
  <div role="status" class="rounded-xl border-l-4 border-cobalt bg-cobalt-soft px-4 py-3 text-sm"><b>Dica.</b> Use Tab para navegar pelos componentes.</div>
  <div role="status" class="rounded-xl border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm"><b>Salvo.</b> Suas alterações foram aplicadas.</div>
  <div role="alert" class="rounded-xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900"><b>Falha.</b> Não foi possível concluir a ação.</div>
</div>`;

export const modal = `<button type="button" data-modal-open class="rounded-full bg-cobalt px-5 py-2.5 font-bold text-white hover:bg-cobalt-dark">Abrir modal</button>
<div data-modal hidden class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
  <div role="dialog" aria-modal="true" aria-labelledby="m-title" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
    <h3 id="m-title" class="text-2xl font-black">Excluir projeto?</h3>
    <p class="mt-2 text-ink/70">Esta ação não pode ser desfeita. Pressione Esc para cancelar.</p>
    <div class="mt-5 flex justify-end gap-2">
      <button type="button" data-modal-close class="rounded-full px-5 py-2.5 font-bold hover:bg-ink/10">Cancelar</button>
      <button type="button" data-modal-close class="rounded-full bg-tang px-5 py-2.5 font-bold text-white hover:brightness-110">Excluir</button>
    </div>
  </div>
</div>`;

export const tabs = `<div data-tabs>
  <div role="tablist" aria-label="Exemplo" class="flex gap-1 border-b border-line">
    <button role="tab" id="t1" aria-controls="p1" aria-selected="true" class="-mb-px border-b-2 border-cobalt px-4 py-2 font-bold text-cobalt aria-[selected=false]:border-transparent aria-[selected=false]:text-ink/60">Visão geral</button>
    <button role="tab" id="t2" aria-controls="p2" aria-selected="false" tabindex="-1" class="-mb-px border-b-2 border-cobalt px-4 py-2 font-bold text-cobalt aria-[selected=false]:border-transparent aria-[selected=false]:text-ink/60">Detalhes</button>
    <button role="tab" id="t3" aria-controls="p3" aria-selected="false" tabindex="-1" class="-mb-px border-b-2 border-cobalt px-4 py-2 font-bold text-cobalt aria-[selected=false]:border-transparent aria-[selected=false]:text-ink/60">Histórico</button>
  </div>
  <div role="tabpanel" id="p1" aria-labelledby="t1" class="py-4">Resumo do projeto e métricas principais.</div>
  <div role="tabpanel" id="p2" aria-labelledby="t2" hidden class="py-4">Especificações técnicas e responsáveis.</div>
  <div role="tabpanel" id="p3" aria-labelledby="t3" hidden class="py-4">Nenhuma atividade registrada ainda.</div>
</div>`;

export const toasts = `<div class="flex flex-wrap gap-2">
  <button type="button" data-toast="ok" class="rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700">Toast de sucesso</button>
  <button type="button" data-toast="info" class="rounded-full bg-cobalt px-5 py-2.5 font-bold text-white hover:bg-cobalt-dark">Toast de info</button>
  <button type="button" data-toast="err" class="rounded-full bg-tang px-5 py-2.5 font-bold text-white hover:brightness-110">Toast de erro</button>
</div>`;

export const accordion = `<div class="divide-y divide-line rounded-xl border border-line bg-white">
  <details class="group p-4" open><summary class="flex cursor-pointer list-none items-center justify-between font-bold">O que é Tinta UI?<span class="transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p class="mt-2 text-ink/70">Um catálogo de componentes feitos só com classes utilitárias.</p></details>
  <details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between font-bold">Posso copiar o código?<span class="transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p class="mt-2 text-ink/70">Sim, use o botão Copiar código em cada seção.</p></details>
</div>`;

export const form = `<form class="max-w-sm space-y-3" onsubmit="return false">
  <div><label for="f-mail" class="mb-1 block text-sm font-bold">E-mail</label>
  <input id="f-mail" type="email" placeholder="voce@exemplo.com" class="w-full rounded-xl border-2 border-line bg-white px-3.5 py-2.5 outline-none focus:border-cobalt"></div>
  <div><label for="f-err" class="mb-1 block text-sm font-bold">Senha</label>
  <input id="f-err" type="password" aria-invalid="true" aria-describedby="f-err-msg" class="w-full rounded-xl border-2 border-red-500 bg-white px-3.5 py-2.5 outline-none">
  <p id="f-err-msg" class="mt-1 text-sm text-red-700">Mínimo de 8 caracteres.</p></div>
  <label class="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" class="h-4 w-4 accent-cobalt"> Lembrar de mim</label>
</form>`;
