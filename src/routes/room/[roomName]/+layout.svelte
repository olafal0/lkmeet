<slot></slot>

<style lang="scss">
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		background-color: #0b0c0b;
	}
	:global(button, input[type="submit"]) {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
	}
</style>
