package com.nexus.devicecloud.entity;

/** Trạng thái kết nối quan sát được. Sẽ do bộ đánh giá heartbeat ghi (Release 2); hiện chỉ có dữ liệu demo. */
public enum ConnectivityStatus {
    UNKNOWN, ONLINE, OFFLINE, DEGRADED
}
