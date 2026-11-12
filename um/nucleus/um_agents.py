"""Pandemonium Python ring: orchestration and agents over the core."""
import ctypes, os, numpy as np, json
L=ctypes.CDLL(os.path.join(os.path.dirname(os.path.abspath(__file__)),"libum.so"))
L.um_d4.restype=ctypes.c_double
L.um_cycloid.restype=ctypes.c_double
L.um_cycloid.argtypes=[ctypes.c_double]*3
L.um_system_zzero.restype=ctypes.c_double
ZN=["Omega","phi-","Sigma","phi+","Alpha"]
def state(table):
    a=np.ascontiguousarray(table,dtype=np.float64); n,m=a.shape
    z=np.zeros(n*m,dtype=np.int32)
    zz=L.um_system_zzero(n,m,a.ctypes.data_as(ctypes.c_void_p),z.ctypes.data_as(ctypes.c_void_p))
    return zz,z.reshape(n,m)
class Agent:
    def __init__(s,name,role): s.name,s.role,s.log=name,role,[]
class Esmeralda(Agent):          # steward of the hinge (day)
    def admit(s,table):
        a=np.asarray(table,float)
        ok=a.ndim==2 and a.shape[0]>1 and np.isfinite(a).all()
        s.log.append(("admit",ok)); return ok
class Esther(Agent):             # verifier of invariants (night)
    def verify(s,zz,zones):
        ok=0<=zz<=1 and zones.min()>=1 and zones.max()<=5
        s.log.append(("verify",ok)); return ok
def run(t0,t1,steps=5):
    esm,est=Esmeralda("Esmeralda","steward"),Esther("ESTHER","verifier")
    out={}
    for k,t in (("T0",t0),("T1",t1)):
        if not esm.admit(t): raise ValueError("hinge refused "+k)
        zz,z=state(t)
        if not est.verify(zz,z): raise RuntimeError("invariant broken "+k)
        out[k]={"zzero":zz,"zones":[[ZN[v-1] for v in r] for r in z.tolist()]}
    out["path"]=[L.um_cycloid(out["T0"]["zzero"],out["T1"]["zzero"],s/steps) for s in range(steps+1)]
    out["D4"]=L.um_d4(); return out
if __name__=="__main__":
    rng=np.random.default_rng(7); t0=rng.normal(size=(40,3)); t1=t0+rng.normal(0,.3,(40,3))
    r=run(t0,t1); print(json.dumps({k:r[k] for k in("D4","path")}))
    print("T0",round(r["T0"]["zzero"],6),"T1",round(r["T1"]["zzero"],6),"first point",r["T0"]["zones"][0])
