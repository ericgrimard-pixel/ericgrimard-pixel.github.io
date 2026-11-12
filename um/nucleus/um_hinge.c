#include <math.h>
#include <stdlib.h>
#include "um.h"
int um_hinge_state(int n,int m,const double*raw,double*zzero,int*zones){
  if(n<2||m<1||!raw) return -1;
  for(long i=0;i<(long)n*m;i++) if(!isfinite(raw[i])) return -1;
  double *a=malloc(sizeof(double)*n*m),*h=malloc(sizeof(double)*n),mu,sd;
  if(!a||!h){free(a);free(h);return -1;}
  for(int j=0;j<m;j++){ um_normalise(n,raw+(long)j*n,a+(long)j*n);
    um_zones(n,a+(long)j*n,&mu,&sd,zones+(long)j*n); }
  um_collapse_h(n,m,a,h);
  *zzero=um_zzero(n,h);
  free(a);free(h);return 0;
}
