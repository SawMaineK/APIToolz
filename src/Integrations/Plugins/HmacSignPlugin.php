<?php

namespace Sawmainek\Apitoolz\Integrations\Plugins;

class HmacSignPlugin implements PluginInterface
{
    public static string $type = 'hmac_sign';

    public function apply(array $config, array $body, array $context): array
    {
        $target = $config['target'] ?? 'sign';
        $algo = $config['algorithm'] ?? 'hmac_sha256';
        $secret = $context[$config['secret']] ?? str_replace(['{{ ', ' }}'], '', $config['secret']);

        ksort($body);
        $query = urldecode(http_build_query($body));
        $signature = match ($algo) {
            'hmac_sha256' => strtoupper(hash_hmac('sha256', $query, $secret)),
            'hmac_sha1'   => strtoupper(hash_hmac('sha1', $query, $secret)),
            default       => throw new \Exception("Unsupported sign algo: $algo"),
        };

        $body[$target] = $signature;
        $body['sign_type'] = strtoupper(str_replace('hmac_', '', $algo));
        return $body;
    }
}
