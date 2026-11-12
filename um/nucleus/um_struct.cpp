// Pandemonium C++ structure: Class 1-4 objects and the agent registry.
#include <string>
#include <vector>
#include <map>
#include <stdexcept>
#include "um.h"
namespace um {
struct Class1 { std::string id; std::vector<double> cols; std::vector<int> zones; };
struct Class2 { std::string name; std::vector<int> members; double weight=1.0; };
struct System4 {
  std::string name; std::vector<Class1> pts; std::vector<Class2> groups; double zzero=0;
  int m() const { return pts.empty()?0:(int)pts[0].cols.size(); }
  void constitute(){ int n=pts.size(),M=m(); std::vector<double> raw(n*M); std::vector<int> z(n*M);
    for(int j=0;j<M;j++) for(int i=0;i<n;i++) raw[j*n+i]=pts[i].cols[j];
    if(um_hinge_state(n,M,raw.data(),&zzero,z.data())!=0) throw std::runtime_error("hinge rejected");
    for(int i=0;i<n;i++){ pts[i].zones.assign(M,0); for(int j=0;j<M;j++) pts[i].zones[j]=z[j*n+i]; } }
};
struct Agent { std::string name, role; bool awake=false; int wins=0; };
struct Registry { std::map<std::string,Agent> a;
  void add(const Agent&x){ a[x.name]=x; } };
}
extern "C" {
// Flat entry for Python: constitute a system, return Z-ZERO
double um_system_zzero(int n,int m,const double*rowmajor,int*zones_out){
  um::System4 s; s.name="sys";
  for(int i=0;i<n;i++){ um::Class1 p; p.id=std::to_string(i);
    p.cols.assign(rowmajor+i*m,rowmajor+i*m+m); s.pts.push_back(p);}
  s.constitute();
  for(int i=0;i<n;i++) for(int j=0;j<m;j++) zones_out[i*m+j]=s.pts[i].zones[j];
  return s.zzero; }
}
