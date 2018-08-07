package edp.core.common.cache;

public enum Caches {
    datasource,
    query(10, 100)
    ;

    private int maxSize = 1000; //默认最大缓存数量
    private int ttl = 3600;     //默认过期时间（单位：秒）

    Caches() {
    }

    Caches(int ttl, int maxSize) {
        this.ttl = ttl;
        this.maxSize = maxSize;
    }

    public int getMaxSize() {
        return maxSize;
    }

    public int getTtl() {
        return ttl;
    }
}
