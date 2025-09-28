<?php

namespace Sawmainek\Apitoolz\Integrations;

use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Illuminate\Support\Str;

class ExpressionEvaluator
{
    protected ExpressionLanguage $evaluator;

    public function __construct()
    {
        $this->evaluator = new ExpressionLanguage();

        // 🔹 Environment helpers
        $this->evaluator->register(
            'env',
            fn($v) => sprintf('getenv("%s")', $v),
            fn($args, $v) => env($v)
        );

        // 🔹 Time helpers
        $this->evaluator->register(
            'now',
            fn() => 'time()',
            fn() => now()->timestamp
        );

        // 🔹 UUID
        $this->evaluator->register(
            'uuid',
            fn() => '\Illuminate\Support\Str::uuid()',
            fn() => Str::uuid()->toString()
        );

        // 🔹 Encoding helpers
        $this->evaluator->register(
            'base64',
            fn($v) => sprintf('base64_encode(%s)', $v),
            fn($args, $v) => base64_encode($v)
        );

        // 🔹 Random helpers
        $this->evaluator->register(
            'random_string',
            fn($n) => sprintf('bin2hex(random_bytes(%s))', $n),
            fn($args, $n) => bin2hex(random_bytes($n))
        );

        // 🔹 String helpers
        $this->evaluator->register(
            'upper',
            fn($v) => sprintf('strtoupper(%s)', $v),
            fn($args, $v) => strtoupper($v)
        );

        $this->evaluator->register(
            'lower',
            fn($v) => sprintf('strtolower(%s)', $v),
            fn($args, $v) => strtolower($v)
        );

        $this->evaluator->register(
            'substr',
            fn($v, $s, $l = null) => sprintf('substr(%s,%s,%s)', $v, $s, $l ?? 'null'),
            fn($args, $v, $s, $l = null) => substr($v, $s, $l)
        );

        $this->evaluator->register(
            'concat',
            fn(...$args) => implode('.', $args),
            fn($args, ...$vals) => implode('', $vals)
        );

        // 🔹 Math helpers
        $this->evaluator->register('round', fn($v, $p = 0) => sprintf('round(%s,%s)', $v, $p), fn($args, $v, $p = 0) => round($v, $p));
        $this->evaluator->register('ceil', fn($v) => sprintf('ceil(%s)', $v), fn($args, $v) => ceil($v));
        $this->evaluator->register('floor', fn($v) => sprintf('floor(%s)', $v), fn($args, $v) => floor($v));
        $this->evaluator->register('abs', fn($v) => sprintf('abs(%s)', $v), fn($args, $v) => abs($v));

        // 🔹 Laravel route helper
        $this->evaluator->register(
            'route',
            fn($name, $params = []) => sprintf('route("%s", %s)', $name, var_export($params, true)),
            fn($args, $name, $params = []) => route($name, $params)
        );
    }

    public function evaluate(string $expression, array $context = [])
    {
        try {
            return $this->evaluator->evaluate($expression, $context);
        } catch (\Throwable $e) {
            // Fallback: return the original string if evaluation fails
            return $expression;
        }
    }
}
