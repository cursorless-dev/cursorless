string name = "hello";

typedef struct {
    union{
        struct{
            double x;
            double y;
            double z;
        };
        double raw[3];
    };
}vec3d_t;

vec3d_t v;
v.x = 4.0;
v.raw[1] = 3.0; // Equivalent to v.y = 3.0
v.z = 2.0;

struct aaa {
  int bbb;
};

union aaa {
  int ccc;
};

typedef struct {
  int bbb;
} bbb;

struct aaa { int bbb; };
union bbb { int ccc; };
enum ccc { ddd, eee };

typedef struct { int fff; } ggg;
typedef union { int hhh; } iii;
typedef enum { jjj, kkk } lll;

class aaa { int bbb; };
enum class ccc { ddd, eee };

Aaa bbb(ccc);
Ddd *eee = new Fff(ggg);

int main() {
  struct myStructure s1;
  return 0;
}
