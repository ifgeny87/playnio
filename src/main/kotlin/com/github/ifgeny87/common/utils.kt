package com.github.ifgeny87.common

/**
 * Вычисляет расстояние между двумя точками
 */
fun distance(x1: Double, y1: Double, x2: Double, y2: Double) = Math.sqrt(Math.pow(x1 - x2, 2.0) + Math.pow(y1 - y2, 2.0))