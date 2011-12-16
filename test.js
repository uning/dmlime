
var a = {p:1};
var b = a;
console.log(a===b);
var c
c = a && a.p || 0; 
console.log('c = a && a.p || 0; c = ',c);
c = a && a.p && a.p.p || 0; 
console.log('c = a && a.p.p || 0; c = ',c);
