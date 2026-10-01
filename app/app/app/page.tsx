"use client"
import {useEffect,useState} from "react"
import {supabase} from "../lib/supabaseClient"

export default function Page(){
const [user,setUser]=useState<any>(null)
const [email,setEmail]=useState("");const [pass,setPass]=useState("")
const [caption,setCaption]=useState("");const [file,setFile]=useState<any>(null)
const [posts,setPosts]=useState<any[]>([])
const [loading,setLoading]=useState(false)

useEffect(()=>{
supabase.auth.getUser().then(({data})=>setUser(data.user))
const {data:listener}=supabase.auth.onAuthStateChange((e,u)=>setUser(u))
loadPosts()
return()=>listener.subscription.unsubscribe()
},[])

async function loadPosts(){
const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false})
if(data) setPosts(data)
}

async function signUp(){
const {error}=await supabase.auth.signUp({email,password:pass})
if(error) alert(error.message); else alert("Check email to confirm!")
}
async function signIn(){
const {error}=await supabase.auth.signInWithPassword({email,password:pass})
if(error) alert(error.message)
}
async function signOut(){await supabase.auth.signOut();setUser(null)}

async function createPost(){
if(!file) return alert("Pick image")
setLoading(true)
const name=`${Date.now()}-${file.name}`
const {error:upErr}=await supabase.storage.from("images").upload(name,file)
if(upErr){alert(upErr.message);setLoading(false);return}
const {data:{publicUrl}}=supabase.storage.from("images").getPublicUrl(name)
const {error}=await supabase.from("posts").insert({caption,image_url:publicUrl,user_id:user.id})
setLoading(false)
if(error) alert(error.message); else {setCaption("");setFile(null);loadPosts()}
}

if(!user) return <div style={{maxWidth:400,margin:"60px auto",padding:20}}>
<h1 style={{fontSize:32,fontWeight:800}}>TradeSnap</h1><p style={{color:"#9ca3af"}}>Sign in to share your trades</p>
<div className="card" style={{marginTop:20}}>
<label>Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)}/>
<label style={{marginTop:12,display:"block"}}>Password</label><input type="password" className="input" value={pass} onChange={e=>setPass(e.target.value)}/>
<div style={{display:"flex",gap:10,marginTop:20}}><button className="btn" onClick={signIn}>Login</button><button className="btn" style={{background:"#222",color:"#fff"}} onClick={signUp}>Sign Up</button></div>
</div></div>

return <div style={{maxWidth:600,margin:"0 auto",padding:16}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0"}}><b style={{fontSize:20}}>TradeSnap</b><button onClick={signOut} style={{background:"#1c1c1c",color:"#fff",border:"1px solid #2a2a2a",padding:"8px 14px",borderRadius:999}}>Logout</button></div>

<div className="card">
<label>Trade caption</label><input className="input" placeholder="AAPL + $240 profit today..." value={caption} onChange={e=>setCaption(e.target.value)}/>
<label style={{marginTop:12,display:"block"}}>Screenshot</label><input type="file" accept="image/*" className="input" onChange={e=>setFile(e.target.files?.[0])}/>
<button className="btn" style={{width:"100%",marginTop:16}} onClick={createPost} disabled={loading}>{loading?"Posting...":"Post Trade"}</button>
</div>

<div style={{marginTop:24,display:"grid",gap:16}}>
{posts.map(p=><div key={p.id} className="card"><img src={p.image_url} style={{width:"100%",borderRadius:12,marginBottom:10}}/><div>{p.caption}</div><div style={{fontSize:12,color:"#6b7280",marginTop:8}}>{new Date(p.created_at).toLocaleString()}</div></div>)}
</div>
</div>
}
