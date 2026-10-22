package com.nexus.devicecloud.repository;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class DeviceSpecificationsTest {

    @Test
    void escapeLikeNeutralizesWildcards() {
        assertEquals("100\\%\\_done", DeviceSpecifications.escapeLike("100%_done"));
    }

    @Test
    void escapeLikeEscapesBackslashFirst() {
        assertEquals("a\\\\b\\%", DeviceSpecifications.escapeLike("a\\b%"));
    }

    @Test
    void escapeLikeLeavesPlainTextUntouched() {
        assertEquals("hn-rtr-01", DeviceSpecifications.escapeLike("hn-rtr-01"));
    }
}
