﻿//kino.razor https://github.com/kinogam/kino.razor
eval(function (p, a, c, k, e, r) { e = function (c) { return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) r[e(c)] = k[c] || e(c); k = [function (e) { return r[e] } ]; e = function () { return '\\w+' }; c = 1 }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p } ('(5(){3 m={U:5(a){6(\'\'+a).2(/&/g,\'&T;\').2(/</g,\'&S;\').2(/>/g,\'&R;\').2(/"/g,\'&N;\').2(/\'/g,\'&#E;\').2(/\\//g,\'&#K;\')}};3 n=5(a){6 a.2(/\\\\\\\\/g,\'\\\\\').2(/\\\\\'/g,"\'")};3 o=\'@\';3 p=5(d,e){3 f=7 q(o+"((?:8|H|G)\\\\s*\\\\([^\\\\)]+\\\\)\\\\s*{)","g");3 g=7 q(o+"{([^}]*)}","g");3 h="(?:7\\\\s+[a-y-9]+\\\\([^\\\\)]*\\\\)|[a-y-9]+)(?:\\\\.|\\\\([^\\\\)]*\\\\)|[a-y-9\\\\[\\\\]]+)*";3 i=7 q(o+"(\\\\("+h+"\\\\)|"+h+")","M");3 j=7 q("([}\\\\s])(u\\\\s*(?:8\\\\s*\\\\([^\\\\)]+\\\\))?{)","g");3 k=7 q(o+o,"g");3 l=7 q(o+"}","g");3 s="3 4=\'\';F(C||{}){4=4+\'"+d.2(/\\r/g,\'\\\\r\').2(/\\\\/g,\'\\\\\\\\\').2(/\'/g,"\\\\\'").2(/\\n/g,\'\').2(/\\\\\\\\r/g,\'\').2(/\\t/g,\'\').2(k,\'%$a$%\').2(l,\'%$b$%\').2(g,5(a,b){6"\';"+n(b)+"4=4+\'"}).2(f,5(a,b){6"\';"+n(b)+"4=4+\'"}).2(j,5(a,b,c){6"\';"+b+n(c)+"4=4+\'"}).2(i,5(a,b){3 c="\';";c=c+"8(A "+b+" === \'B\')"+b+"=\'\';";c=c+"4=4+"+b+";4=4+\'";6 c}).2(/}(?!\\s*u)/g,"\';}4=4+\'").2(/%\\$b\\$%/g,\'}\').2(/%\\$a\\$%/g,o)+"\';};6 4;";6 7 I(\'J\',\'C\',s)};3 t=5(){8(w.L==1)6 p(w[0]);u{3 a;3 b=w[0];8(A b===\'5\')a=b;u a=p(b);6 a.O(P,m,w[1])}};t.Q=5(a){o=a.2(/([\\^\\$\\[\\]\\(\\)])/g,"\\\\$1")};8(A z!=\'B\'&&z.D){z.D=t}u{x.v=x.v?x.v:{};x.v.V=t}})();', 58, 58, '||replace|var|__p|function|return|new|if||||||||||||||||||RegExp||||else|kino|arguments|this|z0|module|typeof|undefined|obj|exports|x27|with|while|for|Function|Html|x2F|length|ig|quot|call|null|use|gt|lt|amp|escape|razor'.split('|'), 0, {}));
(function () {
    //namespace
    this.itour = this.itour ? this.itour : {};
    this.itour.util = this.itour.util ? this.itour.util : {};
    this.itour.util.template = kino.razor;
    this.itour.util.getTemplateFunc = kino.razor;

    this.itour.util.getTempContent = function(id, data){
        ///<summary>
        ///根据dom id来获取模板
        ///</summary>
        ///<param name="id" type="String">模板id</param>
        ///<param name="data" type="Object">模板数据</param>
        ///<returns type="String">转换后的字符串</returns>
        var doc = itour.util._doc;
        doc = doc || document;
        var tempdom = doc.getElementById(id);
        return itour.util.template(tempdom.innerHTML, data);
    };
})();
