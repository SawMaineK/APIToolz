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

        // ------------------------
        // 🌍 Environment helpers
        // ------------------------
        $this->evaluator->register(
            'env',
            fn($v) => sprintf('getenv("%s")', $v),
            fn($args, $v) => env($v)
        );

        // ------------------------
        // 🕒 Time helpers
        // ------------------------
        $this->evaluator->register('now', fn() => 'time()', fn() => now()->timestamp);
        $this->evaluator->register('date', fn($f = 'Y-m-d H:i:s') => sprintf('date("%s")', $f), fn($args, $f = 'Y-m-d H:i:s') => date($f));
        $this->evaluator->register('strtotime', fn($v) => sprintf('strtotime(%s)', $v), fn($args, $v) => strtotime($v));
        $this->evaluator->register('diff_minutes', fn($a, $b) => sprintf('(%s - %s) / 60', $a, $b), fn($args, $a, $b) => ($a - $b) / 60);

        // ------------------------
        // 🪪 UUID
        // ------------------------
        $this->evaluator->register('uuid', fn() => '\Illuminate\Support\Str::uuid()', fn() => Str::uuid()->toString());

        // ------------------------
        // 🧩 Encoding helpers
        // ------------------------
        $this->evaluator->register('base64', fn($v) => sprintf('base64_encode(%s)', $v), fn($args, $v) => base64_encode($v));
        $this->evaluator->register('base64_decode', fn($v) => sprintf('base64_decode(%s)', $v), fn($args, $v) => base64_decode($v));
        $this->evaluator->register('json_encode', fn($v) => sprintf('json_encode(%s)', $v), fn($args, $v) => json_encode($v, JSON_UNESCAPED_UNICODE));
        $this->evaluator->register('json_decode', fn($v) => sprintf('json_decode(%s,true)', $v), fn($args, $v) => json_decode($v, true));

        // ------------------------
        // 🎲 Random helpers
        // ------------------------
        $this->evaluator->register('random_string', fn($n) => sprintf('bin2hex(random_bytes(%s))', $n), fn($args, $n) => bin2hex(random_bytes($n)));
        $this->evaluator->register('random_digits', fn($n) => sprintf('str_pad(random_int(0, pow(10,%s)-1), %s, "0", STR_PAD_LEFT)', $n, $n), fn($args, $n) => str_pad(random_int(0, pow(10, $n) - 1), $n, '0', STR_PAD_LEFT));
        $this->evaluator->register('random_code', fn($prefix, $n) => sprintf('"%s" . str_pad(random_int(0, pow(10,%s)-1), %s, "0", STR_PAD_LEFT)', $prefix, $n, $n), fn($args, $prefix, $n) => $prefix . str_pad(random_int(0, pow(10, $n) - 1), $n, '0', STR_PAD_LEFT));
        $this->evaluator->register('random_choice', fn($arr) => sprintf('%s[array_rand(%s)]', $arr, $arr), fn($args, $arr) => is_array($arr) ? $arr[array_rand($arr)] : null);

        // ------------------------
        // 🔠 String helpers
        // ------------------------
        $this->evaluator->register('upper', fn($v) => sprintf('strtoupper(%s)', $v), fn($args, $v) => strtoupper($v));
        $this->evaluator->register('lower', fn($v) => sprintf('strtolower(%s)', $v), fn($args, $v) => strtolower($v));
        $this->evaluator->register('substr', fn($v, $s, $l = null) => sprintf('substr(%s,%s,%s)', $v, $s, $l ?? 'null'), fn($args, $v, $s, $l = null) => substr($v, $s, $l));
        $this->evaluator->register('concat', fn(...$args) => implode('.', $args), fn($args, ...$vals) => implode('', $vals));
        $this->evaluator->register('pad', fn($v, $len, $padStr = '0', $type = STR_PAD_LEFT) => sprintf('str_pad(%s,%s,"%s",%s)', $v, $len, addslashes($padStr), $type), fn($args, $v, $len, $padStr = '0', $type = STR_PAD_LEFT) => str_pad($v, (int)$len, (string)$padStr, (int)$type));
        $this->evaluator->register('trim', fn($v) => sprintf('trim(%s)', $v), fn($args, $v) => trim($v));
        $this->evaluator->register('replace', fn($s, $search, $replace) => sprintf('str_replace(%s,%s,%s)', $search, $replace, $s), fn($args, $s, $search, $replace) => str_replace($search, $replace, $s));
        $this->evaluator->register('slug', fn($v) => sprintf('Str::slug(%s)', $v), fn($args, $v) => Str::slug($v));
        $this->evaluator->register('length', fn($v) => sprintf('strlen(%s)', $v), fn($args, $v) => strlen($v));
        $this->evaluator->register('contains', fn($v, $needle) => sprintf('strpos(%s,%s)!==false', $v, $needle), fn($args, $v, $needle) => str_contains($v, $needle));

        // ------------------------
        // ➕ Math & DB aggregation helpers
        // ------------------------
        $this->evaluator->register('round', fn($v, $p = 0) => sprintf('round(%s,%s)', $v, $p), fn($args, $v, $p = 0) => round($v, $p));
        $this->evaluator->register('ceil', fn($v) => sprintf('ceil(%s)', $v), fn($args, $v) => ceil($v));
        $this->evaluator->register('floor', fn($v) => sprintf('floor(%s)', $v), fn($args, $v) => floor($v));
        $this->evaluator->register('abs', fn($v) => sprintf('abs(%s)', $v), fn($args, $v) => abs($v));

        // 🔹 Extended sum (supports model aggregation)
        $this->evaluator->register('sum', fn(...$args) => implode('+', $args), function ($args, ...$vals) {
            if (isset($vals[0]) && is_string($vals[0]) && class_exists($vals[0])) {
                $model = app($vals[0]);
                $field = $vals[1] ?? null;
                $conditions = $vals[2] ?? [];
                if (!$field) return 0;
                $query = $model::query();
                foreach ($conditions as $k => $v) $query->where($k, $v);
                return $query->sum($field);
            }
            return array_sum(array_map(fn($v) => is_numeric($v) ? $v : 0, $vals));
        });

        // 🔹 Count for model
        $this->evaluator->register('count_model', fn($m, $c = []) => '', function ($args, $m, $c = []) {
            if (!class_exists($m)) return 0;
            $q = app($m)::query();
            foreach ($c as $k => $v) $q->where($k, $v);
            return $q->count();
        });

        // 🔹 Average for model
        $this->evaluator->register('avg', fn(...$args) => implode('+', $args), function ($args, ...$vals) {
            if (isset($vals[0]) && is_string($vals[0]) && class_exists($vals[0])) {
                $m = app($vals[0]);
                $f = $vals[1] ?? null;
                $c = $vals[2] ?? [];
                $q = $m::query();
                foreach ($c as $k => $v) $q->where($k, $v);
                return $q->avg($f);
            }
            return array_sum($vals) / max(count($vals), 1);
        });

        // 🔹 Max / Min for model
        foreach (['max_model' => 'max', 'min_model' => 'min'] as $fn => $method) {
            $this->evaluator->register($fn, fn($m, $f, $c = []) => '', function ($args, $m, $f, $c = []) use ($method) {
                if (!class_exists($m)) return null;
                $q = app($m)::query();
                foreach ($c as $k => $v) $q->where($k, $v);
                return $q->{$method}($f);
            });
        }

        // ------------------------
        // 🔢 Array helpers
        // ------------------------
        $this->evaluator->register('join', fn($arr, $sep = ',') => sprintf('implode("%s", %s)', $sep, $arr), fn($args, $arr, $sep = ',') => implode($sep, $arr));
        $this->evaluator->register('count', fn($arr) => sprintf('count(%s)', $arr), fn($args, $arr) => is_countable($arr) ? count($arr) : 0);
        $this->evaluator->register('unique', fn($arr) => sprintf('array_unique(%s)', $arr), fn($args, $arr) => array_unique($arr));
        $this->evaluator->register('first', fn($arr) => sprintf('reset(%s)', $arr), fn($args, $arr) => is_array($arr) ? reset($arr) : null);
        $this->evaluator->register('last', fn($arr) => sprintf('end(%s)', $arr), fn($args, $arr) => is_array($arr) ? end($arr) : null);

        // ------------------------
        // 🛤️ Laravel route helper
        // ------------------------
        $this->evaluator->register('route', fn($name, $params = []) => sprintf('route("%s", %s)', $name, var_export($params, true)), fn($args, $name, $params = []) => route($name, $params));
    }

    public function evaluate(string $expression, array $context = [])
    {
        try {
            return $this->evaluator->evaluate($expression, $context);
        } catch (\Throwable $e) {
            return $expression; // fallback gracefully
        }
    }
}
