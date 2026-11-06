#pragma once
// Six original status bytes remain intact. The last two bytes encode x4,y4,
// selected helper3, purpose2, epoch3. Zero means no call. Coordinates are advisory.
struct V1CallReader {
    unsigned last=0;int read=-1000,seen=-1000;
    constexpr bool observe(unsigned packet,int round){
        const int age=(round-static_cast<int>((packet>>13)&7))&7;
        if(packet!=last){seen=read>=0&&round-read<=2&&age<=2?round-age:-1000;last=packet;}
        read=round;return packet!=0&&((packet>>8)&7)<6&&age<=2&&round-seen>=0&&round-seen<=2;
    }
    constexpr void published(unsigned packet,int round){last=packet;read=seen=round;}
};
constexpr unsigned v1Pack(int x,int y,int helper,int purpose,int round){const unsigned p=(x&15)|((y&15)<<4)|((helper&7)<<8)|((purpose&3)<<11)|((round&7)<<13);return p?p:(7u<<13);}
static_assert(v1Pack(15,15,5,3,7)==65023);
static_assert([]{V1CallReader r;const auto a=v1Pack(4,4,1,0,1),b=v1Pack(4,4,1,0,2);return !r.observe(a,1)&&r.observe(b,2)&&r.observe(b,3)&&!r.observe(b,5)&&!r.observe(b,10);}());

static_assert(v1Pack(0,0,0,0,8)!=0);
