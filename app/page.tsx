"use client";
import {useState} from "react";
const suggestions=["Responda um cliente que achou o preço alto","Crie uma promoção para horários vagos","Recupere um cliente que não respondeu"];
export default function Home(){
 const [message,setMessage]=useState("");
 return <main>
  <aside>
   <div className="brand"><b>✦</b><div><small>ONTOP</small><strong>Atendimento IA</strong></div></div>
   <button className="new">✦ Nova conversa</button>
   <nav><a className="active">⌁ Assistente</a><a>⚡ Ferramentas</a><a>◎ Clientes</a></nav>
   <div className="quota"><div><em>Plano Free</em><span>3 de 5</span></div><i><u /></i><p>Suas perguntas renovam todos os dias.</p><a>Conhecer Premium →</a></div>
  </aside>
  <section className="workspace">
   <header><div><strong>Assistente de atendimento</strong><small><i /> Ambiente de demonstração</small></div><button>ON</button></header>
   <div className="content">
    <div className="hero">
     <div className="copy"><b className="orb">✦</b><em>IA PARA PEQUENOS NEGÓCIOS</em><h1>O que você precisa <span>responder hoje?</span></h1><p>Cole uma conversa, explique a situação e receba uma resposta profissional, natural e pronta para adaptar.</p><div className="pills"><i>✓ Respostas naturais</i><i>✓ Foco no seu negócio</i><i>✓ Pronto para copiar</i></div></div>
     <div className="art"><img src="/assistente-ia-hero.png" alt="Assistente digital com conversas e agenda"/><div><small>PREMIUM</small><b>50</b><span>perguntas por dia</span></div></div>
    </div>
    <div className="suggestions">{suggestions.map(s=><button key={s} onClick={()=>setMessage(s)}>✦<span>{s}</span></button>)}</div>
    <div className="composer"><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ex.: O cliente perguntou o preço e depois não respondeu..." /><footer><small>↻ 2 perguntas restantes hoje</small><button disabled={!message.trim()}>↑</button></footer></div>
    <div className="tools"><article><b>◎</b><div><strong>Resposta inteligente</strong><p>Respostas claras e prontas para enviar.</p></div></article><article><b>↗</b><div><strong>Recuperar clientes</strong><p>Retornos naturais para contatos parados.</p></div></article><article><b>□</b><div><strong>Preencher agenda</strong><p>Campanhas rápidas para horários disponíveis.</p></div></article></div>
    <div className="pricing"><div><em>PREMIUM INICIAL</em><h2>Mais espaço para atender, divulgar e acompanhar.</h2><p>50 perguntas renovadas diariamente e todas as ferramentas.</p></div><div className="price"><span>R$ <b>11,90</b>/mês</span><button>Começar no Premium →</button></div></div>
   </div>
  </section>
 </main>
}
