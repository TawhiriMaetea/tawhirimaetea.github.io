window.helpSystem = window.helpSystem || {};

window.helpSystem.getRects = function(ids){
    const result = {};
    ids.forEach(id=>{
        const el=document.getElementById(id);
        if(el){
            const r=el.getBoundingClientRect();
            result[id]={ X:r.left, Y:r.top, Width:r.width, Height:r.height };
        }
    });
    return result;
};

window.helpSystem.startTracking = function(dotnetRef, ids){
    function update(){
        dotnetRef.invokeMethodAsync('UpdateRects', window.helpSystem.getRects(ids));
    }
    const throttled = throttle(update, 30);
    window.addEventListener('scroll', throttled, {passive:true});
    window.addEventListener('resize', throttled);
    update();
    return {
        dispose(){
            window.removeEventListener('scroll', throttled);
            window.removeEventListener('resize', throttled);
        }
    };
    function throttle(fn, ms){
        let last=0, pending=null;
        return function(){
            const now=Date.now();
            if(now-last>=ms){
                last=now; fn();
            }else if(!pending){
                pending=setTimeout(()=>{ last=Date.now(); pending=null; fn(); }, ms-(now-last));
            }
        };
    }
};

window.helpSystem.measureBubbles = function(ids){
    const result={};
    ids.forEach(id=>{
        const el=document.getElementById('help-bubble-'+id);
        if(el){
            const r=el.getBoundingClientRect();
            result[id]={ X:r.left, Y:r.top, Width:r.width, Height:r.height };
        }
    });
    return result;
};