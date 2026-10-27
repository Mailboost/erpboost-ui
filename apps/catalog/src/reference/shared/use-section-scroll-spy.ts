import {useCallback,useEffect,useState,type RefObject} from "react";
export function useSectionScrollSpy({rootRef,sectionIds,anchorId,offsetPx=96}:{rootRef:RefObject<HTMLDivElement|null>;sectionIds:string[];anchorId:(id:string)=>string;offsetPx?:number}) {
 const [active,selectActive]=useState(sectionIds[0]);
 useEffect(()=>{const root=rootRef.current;if(!root)return;const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0]){const id=sectionIds.find(id=>anchorId(id)===visible[0].target.id);if(id)selectActive(id)}},{rootMargin:`-${offsetPx}px 0px -50% 0px`});sectionIds.forEach(id=>{const el=root.querySelector(`#${CSS.escape(anchorId(id))}`);if(el)observer.observe(el)});return()=>observer.disconnect()},[rootRef,sectionIds,anchorId,offsetPx]);
 const scrollToSection=useCallback((id:string)=>{rootRef.current?.querySelector(`#${CSS.escape(anchorId(id))}`)?.scrollIntoView({behavior:"smooth",block:"start"});},[rootRef,anchorId]);
 return {active,selectActive,scrollToSection};
}
