<?php
namespace Sawmainek\Apitoolz\Integrations\Plugins;

use Sawmainek\Apitoolz\Integrations\ExpressionEvaluator;

class KBZPaySignPlugin implements PluginInterface
{
    public static string $type = 'kbzpay_sign';

    public function apply(array $config, array $body, array $context): array
    {
        $target = $config['target'] ?? 'sign';
        $merchantKey = $this->interpolate($config['secret'], $context);

        if(isset($body['Request'])) {
            // Ensure numeric values are integers
            $body = $body['Request'];
            $body['biz_content']['total_amount'] = (int) ($body['biz_content']['total_amount'] ?? 0);
            $body['timestamp'] = (int) ($body['timestamp'] ?? time());

            // Flatten array for signing
            $flatKeyVal = $this->flattenArray($body);

            // Generate signature
            $body[$target] = $this->signature($this->joinKeyValue($flatKeyVal), $merchantKey);
            $body['sign_type'] = 'SHA256';

            return ['Request' => $body];
        } else {
            // Flatten array for signing
            $flatKeyVal = $this->flattenArray($body);
            // Generate signature
            $body[$target] = $this->signature($this->joinKeyValue($flatKeyVal), $merchantKey);
            return $body;
        }

    }

    protected function interpolate($value, array $context)
    {
        if (!is_string($value)) return $value;

        return preg_replace_callback('/{{\s*(.+?)\s*}}/', function ($matches) use ($context) {
            return (new ExpressionEvaluator())->evaluate($matches[1], $context);
        }, $value);
    }

    /**
     * Generate a SHA256 signature from text and merchant key.
     */
    public function signature($text, $merchantKey)
    {
        $toSignString = $text . "&key=" . $merchantKey;

        return strtoupper(hash("sha256", $toSignString));
    }

    public static function joinKeyValue(array $arr)
    {
        $notEmpty = function ($val) {
            return !empty($val) && trim($val) != "";
        };

        $solidArray = array_filter($arr, $notEmpty);

        ksort($solidArray);

        $joinKeyVal = function (&$val, $key) {
            $val = "$key=$val";
        };

        array_walk($solidArray, $joinKeyVal);

        return implode("&", $solidArray);
    }

    protected function flattenArray(array|object $array): array
    {
        $result = [];

        foreach ((array)$array as $key => $value) {
            if (is_array($value) || is_object($value)) {
                // Recursively merge nested values without prefix
                $result = array_merge($result, $this->flattenArray($value));
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }
}
